
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '@/components/common/Loader';
import { Check, AlertTriangle, MailCheck } from 'lucide-react';

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, sendEmailVerification, user } = useAuth();
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed' | 'none'>('none');
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  useEffect(() => {
    const verify = async () => {
      if (token) {
        setVerificationStatus('verifying');
        setIsVerifying(true);
        
        try {
          const success = await verifyEmail(token);
          setVerificationStatus(success ? 'success' : 'failed');
        } catch (error) {
          console.error('Error during verification:', error);
          setVerificationStatus('failed');
        } finally {
          setIsVerifying(false);
        }
      }
    };
    
    verify();
  }, [token, verifyEmail]);
  
  const handleResendVerification = async () => {
    if (email) {
      await sendEmailVerification(email);
    } else if (user) {
      await sendEmailVerification(user.email);
    }
  };
  
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };
  
  const handleGoToLogin = () => {
    navigate('/login');
  };
  
  return (
    <div className="container max-w-md mx-auto pt-8">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {verificationStatus === 'none' && 'Please verify your email address to continue'}
            {verificationStatus === 'verifying' && 'Verifying your email address...'}
            {verificationStatus === 'success' && 'Your email has been successfully verified!'}
            {verificationStatus === 'failed' && 'Email verification failed. The link may have expired.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center py-8">
          {verificationStatus === 'none' && (
            <div className="text-center">
              <MailCheck className="mx-auto h-16 w-16 text-axiom-primary mb-4" />
              <p>We've sent a verification email to your inbox. Please click the link in that email to verify your account.</p>
            </div>
          )}
          
          {verificationStatus === 'verifying' && (
            <Loader size="large" />
          )}
          
          {verificationStatus === 'success' && (
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p>Thank you for verifying your email address. Your account is now fully activated.</p>
            </div>
          )}
          
          {verificationStatus === 'failed' && (
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <p>We couldn't verify your email with this link. It may have expired or been used already.</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          {verificationStatus === 'success' && (
            <Button className="w-full" onClick={handleGoToDashboard}>
              Go to Dashboard
            </Button>
          )}
          
          {(verificationStatus === 'none' || verificationStatus === 'failed') && (
            <>
              <Button variant="outline" className="w-full" onClick={handleResendVerification} disabled={isVerifying}>
                Resend Verification Email
              </Button>
              
              <Button className="w-full mt-2" onClick={handleGoToLogin}>
                Back to Login
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
