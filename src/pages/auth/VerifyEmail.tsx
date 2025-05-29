import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState<
    'verifying' | 'success' | 'error'
  >('verifying');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Verification token is missing');
        setVerificationState('error');
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) {
        throw error;
      }

      // Update user verification status
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .update({ email_verified: true })
          .eq('user_id', user.id);

        // Process referral bonus if user was referred
        const { data: referral } = await supabase
          .from('referrals')
          .select('*')
          .eq('referee_id', user.id)
          .eq('status', 'pending')
          .single();

        if (referral) {
          await supabase.rpc('process_referral_bonus', {
            p_referral_id: referral.id,
            p_bonus_amount: 10 // Default bonus amount
          });
        }
      }

      setVerificationState('success');
      toast.success('Email verified successfully!');

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error verifying email:', error);
      setError(error instanceof Error ? error.message : 'Failed to verify email');
      setVerificationState('error');
    }
  };

  const resendVerification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast.error('No email address found');
        return;
      }

      const { error } = await supabase.auth.resendOtp({
        email: user.email,
        type: 'email'
      });

      if (error) throw error;

      toast.success('Verification email sent!');
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email');
    }
  };

  return (
    <div className="container max-w-md mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center p-4">
            {verificationState === 'verifying' && (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-center text-muted-foreground">
                  Verifying your email address...
                </p>
              </>
            )}

            {verificationState === 'success' && (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-center font-medium text-green-500">
                  Email verified successfully!
                </p>
                <p className="text-center text-muted-foreground mt-2">
                  Redirecting you to the dashboard...
                </p>
              </>
            )}

            {verificationState === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-center font-medium text-destructive">
                  Verification failed
                </p>
                <p className="text-center text-muted-foreground mt-2">
                  {error}
                </p>
                <div className="flex flex-col gap-2 w-full mt-4">
                  <Button
                    variant="outline"
                    onClick={resendVerification}
                  >
                    Resend Verification Email
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => navigate('/auth/login')}
                  >
                    Back to Login
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 