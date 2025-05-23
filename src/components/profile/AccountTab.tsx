
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function AccountTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-muted-foreground">Full Name</div>
            <div className="font-medium">{user.name}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium">{user.email}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">KYC Status</div>
            <div className="font-medium">
              {user.kycVerified ? 'Verified' : 'Not Verified'}
              {!user.kycVerified && (
                <Button 
                  variant="link" 
                  className="text-axiom-primary p-0 ml-2 h-auto"
                  onClick={() => navigate('/wallet')}
                >
                  Complete Verification
                </Button>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Account Type</div>
            <div className="font-medium">Individual</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
