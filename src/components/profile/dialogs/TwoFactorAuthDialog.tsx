
import { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { QrCode, Smartphone, Key } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TwoFactorAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TwoFactorAuthDialog({ open, onOpenChange }: TwoFactorAuthDialogProps) {
  const { user, updateUser } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'setup' | 'verify' | 'disable'>('setup');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  
  const generateQRCode = async () => {
    try {
      // In a real implementation, this would call a backend service to generate QR code
      // For demo purposes, we'll simulate this
      const mockSecret = 'JBSWY3DPEHPK3PXP';
      const appName = 'Axiomify';
      const userEmail = user?.email;
      
      const qrUrl = `otpauth://totp/${appName}:${userEmail}?secret=${mockSecret}&issuer=${appName}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;
      
      setQrCodeUrl(qrCodeUrl);
      setSecretKey(mockSecret);
      setStep('verify');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };
  
  const verifyAndEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    setLoading(true);
    try {
      // In a real implementation, this would verify the TOTP code
      // For demo purposes, we'll accept any 6-digit code
      if (!/^\d{6}$/.test(verificationCode)) {
        throw new Error('Invalid verification code');
      }
      
      const { error } = await supabase
        .from('users')
        .update({ two_factor_enabled: true })
        .eq('id', user?.id);
      
      if (error) throw error;
      
      if (user) {
        await updateUser({
          ...user,
          twoFactorEnabled: true
        });
      }
      
      setTwoFactorEnabled(true);
      toast.success('Two-factor authentication enabled successfully');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error enabling 2FA:', error);
      toast.error(error.message || 'Failed to enable two-factor authentication');
    } finally {
      setLoading(false);
    }
  };
  
  const disable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code to disable 2FA');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ two_factor_enabled: false })
        .eq('id', user?.id);
      
      if (error) throw error;
      
      if (user) {
        await updateUser({
          ...user,
          twoFactorEnabled: false
        });
      }
      
      setTwoFactorEnabled(false);
      toast.success('Two-factor authentication disabled');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error disabling 2FA:', error);
      toast.error(error.message || 'Failed to disable two-factor authentication');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">2FA Status</h3>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
              </p>
            </div>
            <Badge variant={twoFactorEnabled ? 'default' : 'secondary'}>
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          
          {!twoFactorEnabled && step === 'setup' && (
            <div className="space-y-4">
              <div className="text-center">
                <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Enable Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account by enabling 2FA
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">What you'll need:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• An authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>• Your phone to scan the QR code</li>
                  <li>• A verification code from your app</li>
                </ul>
              </div>
              
              <Button onClick={generateQRCode} className="w-full">
                Set up Two-Factor Authentication
              </Button>
            </div>
          )}
          
          {!twoFactorEnabled && step === 'verify' && (
            <div className="space-y-4">
              <div className="text-center">
                <img 
                  src={qrCodeUrl} 
                  alt="2FA QR Code" 
                  className="mx-auto mb-4 border rounded-lg"
                />
                <p className="text-sm text-muted-foreground mb-4">
                  Scan this QR code with your authenticator app
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <Label className="text-sm font-medium">Manual Entry Key</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm bg-background px-2 py-1 rounded border flex-1">
                    {secretKey}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(secretKey);
                      toast.success('Secret key copied to clipboard');
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('setup')} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={verifyAndEnable2FA} 
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Enable 2FA'}
                </Button>
              </div>
            </div>
          )}
          
          {twoFactorEnabled && (
            <div className="space-y-4">
              <div className="text-center">
                <Key className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-medium mb-2">Two-Factor Authentication is Active</h3>
                <p className="text-sm text-muted-foreground">
                  Your account is protected with two-factor authentication
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Security Tips:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Keep your backup codes in a safe place</li>
                  <li>• Don't share your authenticator app with others</li>
                  <li>• Update your app regularly</li>
                </ul>
              </div>
              
              <div>
                <Label htmlFor="disable-code">Enter verification code to disable 2FA</Label>
                <Input
                  id="disable-code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              
              <Button 
                variant="destructive" 
                onClick={disable2FA}
                disabled={loading || verificationCode.length !== 6}
                className="w-full"
              >
                {loading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
