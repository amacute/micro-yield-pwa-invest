import { api } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

export interface KYCVerificationData {
  verificationType: 'basic' | 'advanced';
  documentType: 'passport' | 'national_id' | 'drivers_license';
  documentNumber: string;
  documentExpiry: Date;
  documentFront: File;
  documentBack?: File;
  selfie: File;
  addressProof?: File;
}

export interface KYCStatus {
  verified: boolean;
  level: 'none' | 'basic' | 'advanced';
  verifiedAt: string | null;
  investmentLimit: number;
  pendingVerification: boolean;
}

export interface KYCDocument {
  id: string;
  type: 'passport' | 'national_id' | 'drivers_license';
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  documentUrl: string;
}

export interface KYCSubmission {
  documentType: KYCDocument['type'];
  documentFile: File;
  verificationLevel: 'basic' | 'advanced';
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
  };
}

export const getKYCStatus = async (): Promise<KYCStatus> => {
  const response = await api.get('/api/kyc/status');
  return response.data;
};

export const getKYCDocuments = async (): Promise<KYCDocument[]> => {
  const response = await api.get('/api/kyc/documents');
  return response.data;
};

export const submitKYCVerification = async (data: KYCSubmission): Promise<{ id: string }> => {
  const formData = new FormData();
  formData.append('documentFile', data.documentFile);
  formData.append('documentType', data.documentType);
  formData.append('verificationLevel', data.verificationLevel);
  formData.append('personalInfo', JSON.stringify(data.personalInfo));

  const response = await api.post('/api/kyc/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getDocumentUploadUrl = async (
  documentType: KYCDocument['type']
): Promise<{ uploadUrl: string; documentId: string }> => {
  const response = await api.get(`/api/kyc/upload-url?type=${documentType}`);
  return response.data;
};

export const uploadDocument = async (
  uploadUrl: string,
  file: File
): Promise<void> => {
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });
};

export const getVerificationAttempts = async (): Promise<{
  remainingAttempts: number;
  nextAttemptAllowed: string | null;
}> => {
  const response = await api.get('/api/kyc/attempts');
  return response.data;
};

export const getDocumentPreviewUrl = async (documentId: string): Promise<string> => {
  const response = await api.get(`/api/kyc/documents/${documentId}/preview`);
  return response.data.previewUrl;
};

export const getVerificationHistory = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { verifications: data };
  } catch (error) {
    console.error('Error getting verification history:', error);
    toast.error('Failed to get verification history');
    return { error };
  }
}; 