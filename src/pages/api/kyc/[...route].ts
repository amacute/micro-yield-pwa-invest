import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const route = req.query.route as string[];
  const endpoint = route[0];

  switch (req.method) {
    case 'GET':
      switch (endpoint) {
        case 'status':
          return getKYCStatus(req, res, session.user.id);
        case 'documents':
          return getKYCDocuments(req, res, session.user.id);
        case 'attempts':
          return getVerificationAttempts(req, res, session.user.id);
        case 'upload-url':
          return getUploadUrl(req, res, session.user.id);
        default:
          if (endpoint === 'documents' && route[2] === 'preview') {
            return getDocumentPreview(req, res, session.user.id, route[1]);
          }
          return res.status(404).json({ error: 'Not found' });
      }

    case 'POST':
      switch (endpoint) {
        case 'submit':
          return submitVerification(req, res, session.user.id);
        default:
          return res.status(404).json({ error: 'Not found' });
      }

    case 'PUT':
      switch (endpoint) {
        case 'update-status':
          return updateVerificationStatus(req, res, session.user.id);
        default:
          return res.status(404).json({ error: 'Not found' });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getKYCStatus(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        kycVerified: true,
        kycLevel: true,
        kycVerifiedAt: true,
        investmentLimit: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pendingVerification = await db.kycVerification.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
    });

    return res.json({
      verified: user.kycVerified,
      level: user.kycLevel.toLowerCase(),
      verifiedAt: user.kycVerifiedAt,
      investmentLimit: user.investmentLimit,
      pendingVerification: !!pendingVerification,
    });
  } catch (error) {
    console.error('Error getting KYC status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getKYCDocuments(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const documents = await db.kycVerification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        documentType: true,
        status: true,
        createdAt: true,
        reviewedAt: true,
        rejectionReason: true,
        documentUrl: true,
      },
    });

    return res.json(documents);
  } catch (error) {
    console.error('Error getting KYC documents:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getVerificationAttempts(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const attempts = await db.kycVerificationAttempt.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    const remainingAttempts = 3 - attempts.length;
    const nextAttemptAllowed = remainingAttempts <= 0
      ? new Date(attempts[0].createdAt.getTime() + 24 * 60 * 60 * 1000)
      : null;

    return res.json({
      remainingAttempts,
      nextAttemptAllowed,
    });
  } catch (error) {
    console.error('Error getting verification attempts:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUploadUrl(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const documentType = req.query.type as string;
    if (!['passport', 'national_id', 'drivers_license'].includes(documentType)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    const documentId = nanoid();
    const key = `kyc/${userId}/${documentId}`;

    const { url, fields } = await createPresignedPost(s3, {
      Bucket: BUCKET_NAME,
      Key: key,
      Conditions: [
        ['content-length-range', 0, 5 * 1024 * 1024], // 5MB max
        ['starts-with', '$Content-Type', 'image/'],
      ],
      Expires: 300, // 5 minutes
    });

    return res.json({
      uploadUrl: url,
      fields,
      documentId,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getDocumentPreview(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  documentId: string
) {
  try {
    const document = await db.kycVerification.findFirst({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: document.documentUrl,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes
    return res.json({ previewUrl: url });
  } catch (error) {
    console.error('Error getting document preview:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

const submitVerificationSchema = z.object({
  documentType: z.enum(['passport', 'national_id', 'drivers_license']),
  verificationLevel: z.enum(['basic', 'advanced']),
  personalInfo: z.object({
    fullName: z.string().min(2),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    address: z.string().min(5),
    city: z.string().min(2),
    country: z.string().min(2),
    postalCode: z.string().min(2),
  }),
  documentId: z.string(),
});

async function submitVerification(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const validation = submitVerificationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const { documentType, verificationLevel, personalInfo, documentId } = validation.data;

    // Check rate limiting
    const recentAttempts = await db.kycVerificationAttempt.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (recentAttempts >= 3) {
      return res.status(429).json({ error: 'Too many verification attempts' });
    }

    // Create verification record
    const verification = await db.kycVerification.create({
      data: {
        userId,
        documentType,
        verificationLevel,
        status: 'PENDING',
        documentUrl: `kyc/${userId}/${documentId}`,
        personalInfo,
      },
    });

    // Log attempt
    await db.kycVerificationAttempt.create({
      data: {
        userId,
        verificationId: verification.id,
        ipAddress: req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
      },
    });

    return res.json({ id: verification.id });
  } catch (error) {
    console.error('Error submitting verification:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

const updateStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().optional(),
});

async function updateVerificationStatus(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const validation = updateStatusSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const { status, reason } = validation.data;
    const documentId = req.query.id as string;

    const verification = await db.kycVerification.findUnique({
      where: { id: documentId },
      include: { user: true },
    });

    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    // Update verification status
    await db.kycVerification.update({
      where: { id: documentId },
      data: {
        status,
        rejectionReason: reason,
        reviewedAt: new Date(),
      },
    });

    // If approved, update user's KYC status
    if (status === 'APPROVED') {
      await db.user.update({
        where: { id: verification.userId },
        data: {
          kycVerified: true,
          kycLevel: verification.verificationLevel,
          kycVerifiedAt: new Date(),
          investmentLimit:
            verification.verificationLevel === 'ADVANCED' ? 50000 : 5000,
        },
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error updating verification status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 