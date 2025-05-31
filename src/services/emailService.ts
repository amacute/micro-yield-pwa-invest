import Mailjet from 'node-mailjet';

const mailjet = new Mailjet({
  apiKey: '7278e3497e2c991b1f862374732fe93d',
  apiSecret: '1edefc04464ca88407e89dfd1fe3976d'
});

export const sendVerificationEmail = async (
  toEmail: string,
  toName: string,
  verificationToken: string
) => {
  try {
    const verificationLink = `${window.location.origin}/verify-email?token=${verificationToken}`;

    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: "noreply@axiomify.com",
            Name: "Axiomify"
          },
          To: [
            {
              Email: toEmail,
              Name: toName
            }
          ],
          Subject: "Verify your Axiomify account",
          HTMLPart: `
            <h3>Welcome to Axiomify!</h3>
            <p>Hi ${toName},</p>
            <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
            <p>
              <a href="${verificationLink}" 
                 style="background-color: #0EA5E9; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 4px; display: inline-block;">
                Verify Email Address
              </a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p>${verificationLink}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <br>
            <p>Best regards,</p>
            <p>The Axiomify Team</p>
          `,
          TextPart: `
            Welcome to Axiomify!
            
            Hi ${toName},
            
            Thank you for signing up. Please verify your email address by clicking the link below:
            
            ${verificationLink}
            
            This link will expire in 24 hours.
            
            If you didn't create an account, please ignore this email.
            
            Best regards,
            The Axiomify Team
          `
        }
      ]
    });

    return result.body;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}; 