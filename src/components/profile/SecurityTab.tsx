
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Key, Smartphone, Clock } from 'lucide-react';
import { PasswordDialog } from './dialogs/PasswordDialog';
import { TwoFactorAuthDialog } from './dialogs/TwoFactorAuthDialog';

export function SecurityTab() {
  const { user } = useAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  
  const lastLoginTime = new Date().toLocaleDateString();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password Section */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Password</h3>
                <p className="text-sm text-muted-foreground">
                  Change your account password
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordDialog(true)}
            >
              Change Password
            </Button>
          </div>

          {/* Two-Factor Authentication Section */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={user?.twoFactorEnabled ? 'default' : 'secondary'}>
                {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <Button 
                variant="outline"
                onClick={() => setShowTwoFactorDialog(true)}
              >
                {user?.twoFactorEnabled ? 'Manage' : 'Enable'}
              </Button>
            </div>
          </div>

          {/* Session Management */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Session Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your active sessions
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-muted-foreground">
                    Web Browser • Last active: {lastLoginTime}
                  </p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              
              <Button variant="outline" className="w-full">
                Sign out of all other sessions
              </Button>
            </div>
          </div>

          {/* Security Recommendations */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <h3 className="font-medium mb-3">Security Recommendations</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${user?.twoFactorEnabled ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className={user?.twoFactorEnabled ? 'text-green-600' : 'text-yellow-600'}>
                  {user?.twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Enable two-factor authentication'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600">
                  Strong password is being used
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600">
                  Account email is verified
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <PasswordDialog 
        open={showPasswordDialog} 
        onOpenChange={setShowPasswordDialog} 
      />
      
      <TwoFactorAuthDialog 
        open={showTwoFactorDialog} 
        onOpenChange={setShowTwoFactorDialog} 
      />
    </div>
  );
}
