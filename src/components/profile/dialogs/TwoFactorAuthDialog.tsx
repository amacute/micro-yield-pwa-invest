
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Shield, ShieldOff } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface TwoFactorAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TwoFactorAuthDialog({ open, onOpenChange }: TwoFactorAuthDialogProps) {
  const { user, updateUserProfile, enableTwoFactor, disableTwoFactor } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode] = useState('otpauth://totp/Axiomify:' + user?.email + '?secret=JBSWY3DPEHPK3PXP&issuer=Axiomify');

  const handleToggle2FA = async () => {
    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      let success = false;
      
      if (user?.twoFactorEnabled) {
        success = await disableTwoFactor(verificationCode);
      } else {
        success = await enableTwoFactor(verificationCode);
      }

      if (success) {
        // Update via Supabase
        const { error } = await supabase
          .from('profiles')
          .update({
            two_factor_enabled: !user?.twoFactorEnabled
          })
          .eq('user_id', user?.id);

        if (error) throw error;

        const action = user?.twoFactorEnabled ? 'disabled' : 'enabled';
        toast.success(`Two-factor authentication ${action} successfully`);
        onOpenChange(false);
        setVerificationCode('');
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      toast.error('Failed to update two-factor authentication');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText('JBSWY3DPEHPK3PXP');
    toast.success('Secret key copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {user?.twoFactorEnabled ? <ShieldOff className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
            {user?.twoFactorEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {!user?.twoFactorEnabled && (
            <>
              <div className="text-center">
                <Card className="inline-block p-4">
                  <CardContent className="p-0">
                    <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
                      <QrCode className="h-24 w-24 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
                <p className="text-sm text-muted-foreground mt-2">
                  Scan this QR code with your authenticator app
                </p>
              </div>

              <div>
                <Label>Manual Entry Key</Label>
                <div className="flex gap-2">
                  <Input value="JBSWY3DPEHPK3PXP" readOnly />
                  <Button variant="outline" onClick={copySecret}>
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Use this key if you can't scan the QR code
                </p>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          {user?.twoFactorEnabled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-sm text-yellow-800">
                Warning: Disabling two-factor authentication will make your account less secure.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleToggle2FA} 
            disabled={loading || !verificationCode}
            variant={user?.twoFactorEnabled ? "destructive" : "default"}
          >
            {loading ? 'Processing...' : user?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
