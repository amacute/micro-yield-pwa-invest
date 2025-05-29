
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, ShieldOff } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { generateTOTPSecret, generateQRCodeURL, enableTwoFactor, disableTwoFactor } from '@/services/twoFactorAuthReal';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { BackupCodesDisplay } from './components/BackupCodesDisplay';
import { VerificationCodeInput } from './components/VerificationCodeInput';

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
      const qrUrl = generateQRCodeURL(newSecret, accountName, issuer);
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
        success = await disableTwoFactor(user.id, verificationCode);
      } else {
        const result = await enableTwoFactor(user.id, verificationCode);
        success = result.success;
        if (success && result.backupCodes) {
          setBackupCodes(result.backupCodes);
        }
      }

      if (success) {
        await updateUserProfile?.({
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

  const finishSetup = () => {
    setBackupCodes([]);
    onOpenChange(false);
    setVerificationCode('');
  };

  // Show backup codes after successful 2FA setup
  if (backupCodes.length > 0) {
    return (
      <BackupCodesDisplay
        open={open}
        onOpenChange={onOpenChange}
        backupCodes={backupCodes}
        onFinish={finishSetup}
      />
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
            <QRCodeDisplay qrCodeUrl={qrCodeUrl} secret={secret} />
          )}

          <VerificationCodeInput
            value={verificationCode}
            onChange={setVerificationCode}
            disabled={loading}
          />

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
