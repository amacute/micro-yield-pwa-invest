import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/common/Loader';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export default function EmailVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, sendEmailVerification } = useAuth();
  const email = location.state?.email;

  useEffect(() => {
    const verifyToken = async () => {
      const token = new URLSearchParams(location.search).get('token');
      if (token) {
        setIsVerifying(true);
        try {
          const success = await verifyEmail(token);
          if (success) {
            toast.success('Email verified successfully!');
            navigate('/login');
          } else {
            toast.error('Email verification failed. Please try again.');
          }
        } catch (error) {
          console.error('Verification error:', error);
          toast.error('Email verification failed. Please try again.');
        } finally {
          setIsVerifying(false);
        }
      }
    };

    verifyToken();
  }, [location, verifyEmail, navigate]);

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Email address not found. Please try signing up again.');
      return;
    }

    setIsResending(true);
    try {
      await sendEmailVerification(email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error resending verification:', error);
      toast.error('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="container max-w-md mx-auto pt-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Loader />
            <p className="mt-4">Verifying your email...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto pt-8">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification link to your email address
            {email && <div className="font-medium mt-1">{email}</div>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Please check your inbox and click the verification link to complete your registration.
            If you don't see the email, check your spam folder.
          </p>
          
          <div className="space-y-2">
            <Button
              onClick={handleResendVerification}
              variant="outline"
              disabled={isResending}
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader size="small" className="mr-2" />
                  Resending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </Button>
            
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
