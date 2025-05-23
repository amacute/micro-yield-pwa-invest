
import { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

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
  const [verificationCode, setVerificationCode] = useState('');
  
  const handleToggle2FA = () => {
    // In a real application, this would initiate 2FA setup or removal
    onToggle2FA(!is2FAEnabled);
    if (!is2FAEnabled) {
      toast.success('2FA enabled successfully');
    } else {
      toast.info('2FA disabled');
    }
    onOpenChange(false);
    setVerificationCode('');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
                <p className="text-sm mb-2">1. Scan this QR code with your authenticator app</p>
                <div className="bg-white p-2 rounded-md w-48 h-48 mx-auto mb-4">
                  {/* This would be a QR code in a real implementation */}
                  <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <p className="text-sm text-gray-500">QR Code Placeholder</p>
                  </div>
                </div>
                <p className="text-sm">2. Enter the verification code from your app</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
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
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleToggle2FA}
            disabled={verificationCode.length !== 6}
          >
            {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
