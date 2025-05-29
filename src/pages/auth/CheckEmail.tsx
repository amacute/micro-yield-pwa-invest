import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Mail, ArrowLeft } from 'lucide-react';

export default function CheckEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string>('');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    // Get email from location state or user session
    const getEmail = async () => {
      const emailFromState = location.state?.email;
      if (emailFromState) {
        setEmail(emailFromState);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    };

    getEmail();
  }, [location.state]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const resendVerification = async () => {
    if (countdown > 0) return;

    try {
      const { error } = await supabase.auth.resendOtp({
        email,
        type: 'email'
      });

      if (error) throw error;

      toast.success('Verification email sent!');
      setCountdown(60);
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email');
    }
  };

  const openEmailClient = () => {
    // Common email providers
    const emailProviders: { [key: string]: string } = {
      'gmail.com': 'https://mail.google.com',
      'yahoo.com': 'https://mail.yahoo.com',
      'outlook.com': 'https://outlook.live.com',
      'hotmail.com': 'https://outlook.live.com'
    };

    const domain = email.split('@')[1];
    const providerUrl = emailProviders[domain] || '';

    if (providerUrl) {
      window.open(providerUrl, '_blank');
    } else {
      toast.error('Unable to detect email provider');
    }
  };

  return (
    <div className="container max-w-md mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center p-4">
            <Mail className="h-12 w-12 text-primary mb-4" />
            <p className="text-center">
              We've sent a verification link to:
            </p>
            <p className="text-center font-medium">
              {email}
            </p>
            <p className="text-center text-muted-foreground mt-4">
              Click the link in the email to verify your account.
              If you don't see it, check your spam folder.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              onClick={openEmailClient}
              className="w-full"
            >
              Open Email Client
            </Button>

            <Button
              variant="outline"
              onClick={resendVerification}
              disabled={countdown > 0}
              className="w-full"
            >
              {countdown > 0
                ? `Resend email in ${countdown}s`
                : 'Resend verification email'
              }
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate('/auth/login')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 