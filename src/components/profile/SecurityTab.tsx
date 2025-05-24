
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PasswordDialog } from '@/components/profile/dialogs/PasswordDialog';
import { TwoFactorAuthDialog } from '@/components/profile/dialogs/TwoFactorAuthDialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Monitor, Smartphone, Tablet, X } from 'lucide-react';

export function SecurityTab() {
  const { user, getSessions, terminateSession } = useAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twoFactorEnabled || false);
  
  if (!user) return null;
  
  const handleToggle2FA = (enabled: boolean) => {
    setIs2FAEnabled(enabled);
  };

  const sessions = getSessions();

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('phone')) {
      return <Smartphone className="h-4 w-4" />;
    }
    if (device.toLowerCase().includes('tablet')) {
      return <Tablet className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await terminateSession(sessionId);
      toast.success('Session terminated successfully');
    } catch (error) {
      toast.error('Failed to terminate session');
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Password</div>
              <div className="text-sm text-muted-foreground">
                Keep your account secure with a strong password
              </div>
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
                Add an extra layer of security to your account
              </div>
              <Badge variant={is2FAEnabled ? "default" : "secondary"} className="mt-1">
                {is2FAEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShow2FADialog(true)}
            >
              {is2FAEnabled ? 'Manage 2FA' : 'Enable 2FA'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getDeviceIcon(session.device)}
                  <div>
                    <div className="font-medium">{session.device}</div>
                    <div className="text-sm text-muted-foreground">{session.location}</div>
                    <div className="text-xs text-muted-foreground">
                      Last active: {new Date(session.lastActive).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.id.includes(Date.now().toString().slice(-5)) ? (
                    <Badge variant="default">Current</Badge>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      End
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-muted-foreground">No active sessions</p>
          )}
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              If you see a session you don't recognize, terminate it immediately and change your password.
            </p>
            <Button variant="outline" size="sm">
              Terminate All Other Sessions
            </Button>
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
