import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export const CheckEmail: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-fit">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We've sent you an email with a verification link. Please check your inbox and click the link to verify your account.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
          <div className="pt-4 border-t">
            <a
              href="/auth/login"
              className="text-sm text-primary hover:underline"
            >
              Back to login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 