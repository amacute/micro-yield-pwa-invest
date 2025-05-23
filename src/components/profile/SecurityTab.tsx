
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PasswordDialog } from '@/components/profile/dialogs/PasswordDialog';
import { TwoFactorAuthDialog } from '@/components/profile/dialogs/TwoFactorAuthDialog';

export function SecurityTab() {
  const { user } = useAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  
  if (!user) return null;
  
  const handleToggle2FA = (enabled: boolean) => {
    setIs2FAEnabled(enabled);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Password</div>
                <div className="text-sm text-muted-foreground">Last changed 30 days ago</div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPasswordDialog(true)}
              >
                Change Password
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Two-Factor Authentication</div>
                <div className="text-sm text-muted-foreground">
                  {is2FAEnabled ? 'Enabled' : 'Not enabled'}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShow2FADialog(true)}
              >
                {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Session Management</div>
                <div className="text-sm text-muted-foreground">1 active session</div>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <PasswordDialog 
        open={showPasswordDialog} 
        onOpenChange={setShowPasswordDialog} 
      />
      
      <TwoFactorAuthDialog 
        open={show2FADialog} 
        onOpenChange={setShow2FADialog}
        is2FAEnabled={is2FAEnabled}
        onToggle2FA={handleToggle2FA}
      />
    </>
  );
}
