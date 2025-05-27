import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { verifyEmail } from '@/services/auth';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = React.useState<'verifying' | 'success' | 'error'>('verifying');
  const token = searchParams.get('token');

  React.useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        const { error } = await verifyEmail(token);
        if (error) {
          throw error;
        }
        setStatus('success');
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (error) {
        console.error('Error verifying email:', error);
        setStatus('error');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-fit">
            {status === 'verifying' && (
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'verifying' && 'Verifying your email...'}
            {status === 'success' && 'Email verified!'}
            {status === 'error' && 'Verification failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'verifying' && (
            <p className="text-muted-foreground">
              Please wait while we verify your email address...
            </p>
          )}
          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-green-600">
                Your email has been successfully verified.
              </p>
              <p className="text-muted-foreground">
                You will be redirected to the dashboard in a few seconds...
              </p>
            </div>
          )}
          {status === 'error' && (
            <div className="space-y-2">
              <p className="text-red-600">
                We couldn't verify your email. The verification link may have expired or is invalid.
              </p>
              <p className="text-muted-foreground">
                Please try signing up again or contact support if the problem persists.
              </p>
              <div className="pt-4">
                <a
                  href="/auth/signup"
                  className="text-primary hover:underline"
                >
                  Back to sign up
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 