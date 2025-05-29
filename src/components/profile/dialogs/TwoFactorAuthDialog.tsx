
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Shield, ShieldOff, Copy } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { generateTOTPSecret, enableTwoFactorAuth, disableTwoFactorAuth } from '@/services/twoFactorAuth';

interface TwoFactorAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TwoFactorAuthDialog({ open, onOpenChange }: TwoFactorAuthDialogProps) {
  const { user, updateUserProfile } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (open && !user?.twoFactorEnabled) {
      // Generate new secret for setup
      const newSecret = generateTOTPSecret();
      setSecret(newSecret);
      
      // Generate QR code URL
      const issuer = 'Axiomify';
      const accountName = user?.email || '';
      const qrUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${newSecret}&issuer=${encodeURIComponent(issuer)}`;
      setQrCodeUrl(qrUrl);
    }
  }, [open, user?.twoFactorEnabled, user?.email]);

  const handleToggle2FA = async () => {
    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setLoading(true);
    try {
      let success = false;
      
      if (user.twoFactorEnabled) {
        success = await disableTwoFactorAuth(user.id, verificationCode);
      } else {
        const result = await enableTwoFactorAuth(user.id, verificationCode);
        success = result.success;
        if (success && result.backupCodes) {
          setBackupCodes(result.backupCodes);
        }
      }

      if (success) {
        updateUserProfile?.({
          ...user,
          twoFactorEnabled: !user.twoFactorEnabled
        });

        const action = user.twoFactorEnabled ? 'disabled' : 'enabled';
        toast.success(`Two-factor authentication ${action} successfully`);
        
        if (!user.twoFactorEnabled && backupCodes.length > 0) {
          // Show backup codes for new 2FA setup
          return; // Don't close dialog yet, show backup codes
        }
        
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
    navigator.clipboard.writeText(secret);
    toast.success('Secret key copied to clipboard');
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success('Backup codes copied to clipboard');
  };

  const finishSetup = () => {
    setBackupCodes([]);
    onOpenChange(false);
    setVerificationCode('');
  };

  // Show backup codes after successful 2FA setup
  if (backupCodes.length > 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Two-Factor Authentication Enabled
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Important: Save Your Backup Codes</h3>
              <p className="text-sm text-yellow-700 mb-3">
                These backup codes can be used to access your account if you lose your authenticator device. 
                Save them in a secure location.
              </p>
              
              <div className="bg-white border rounded p-3 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="py-1">{code}</div>
                ))}
              </div>
              
              <Button variant="outline" onClick={copyBackupCodes} className="mt-3 w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copy Backup Codes
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={finishSetup} className="w-full">
              I've Saved My Backup Codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

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
                  Scan this QR code with Google Authenticator, Authy, or similar app
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  QR Code URL: {qrCodeUrl}
                </p>
              </div>

              <div>
                <Label>Manual Entry Key</Label>
                <div className="flex gap-2">
                  <Input value={secret} readOnly className="font-mono" />
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
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="font-mono text-center text-lg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          {user?.twoFactorEnabled && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-800">
                ⚠️ Warning: Disabling two-factor authentication will make your account less secure.
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
            disabled={loading || verificationCode.length !== 6}
            variant={user?.twoFactorEnabled ? "destructive" : "default"}
          >
            {loading ? 'Processing...' : user?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
