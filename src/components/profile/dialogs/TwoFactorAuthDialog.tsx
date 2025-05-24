
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Copy } from 'lucide-react';

interface TwoFactorAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  is2FAEnabled: boolean;
  onToggle2FA: (enabled: boolean) => void;
}

export function TwoFactorAuthDialog({ 
  open, 
  onOpenChange, 
  is2FAEnabled, 
  onToggle2FA 
}: TwoFactorAuthDialogProps) {
  const { enableTwoFactor, disableTwoFactor, user } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mock secret key for 2FA setup
  const secretKey = 'JBSWY3DPEHPK3PXP';
  const qrCodeData = `otpauth://totp/Axiomify:${user?.email}?secret=${secretKey}&issuer=Axiomify`;
  
  const handleToggle2FA = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsProcessing(true);
    try {
      let success = false;
      
      if (is2FAEnabled) {
        success = await disableTwoFactor(verificationCode);
      } else {
        success = await enableTwoFactor(verificationCode);
      }

      if (success) {
        onToggle2FA(!is2FAEnabled);
        toast.success(is2FAEnabled ? '2FA disabled successfully' : '2FA enabled successfully');
        onOpenChange(false);
        setVerificationCode('');
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error) {
      toast.error('Failed to update 2FA settings');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{is2FAEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            {is2FAEnabled 
              ? 'Enter your verification code to disable 2FA'
              : 'Enhance your account security by enabling two-factor authentication'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {!is2FAEnabled ? (
            <>
              <div className="bg-muted p-4 rounded-md mb-4">
                <p className="text-sm mb-3 font-medium">Setup Instructions:</p>
                <ol className="text-sm space-y-2 mb-4">
                  <li>1. Install an authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>2. Scan the QR code below or manually enter the secret key</li>
                  <li>3. Enter the 6-digit code from your app</li>
                </ol>
                
                <div className="bg-white p-4 rounded-md border mb-4">
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 flex items-center justify-center mb-3">
                    <p className="text-sm text-gray-500">QR Code for: {qrCodeData}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Secret Key:</Label>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">{secretKey}</code>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(secretKey)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
            </>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code from your authenticator app"
                maxLength={6}
              />
              <p className="text-sm text-muted-foreground">
                Enter the verification code from your authenticator app to disable 2FA
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleToggle2FA}
            disabled={verificationCode.length !== 6 || isProcessing}
          >
            {isProcessing ? 'Processing...' : (is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
