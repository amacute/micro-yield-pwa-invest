
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Copy } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface BackupCodesDisplayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backupCodes: string[];
  onFinish: () => void;
}

export function BackupCodesDisplay({ 
  open, 
  onOpenChange, 
  backupCodes, 
  onFinish 
}: BackupCodesDisplayProps) {
  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success('Backup codes copied to clipboard');
  };

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
          <Button onClick={onFinish} className="w-full">
            I've Saved My Backup Codes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
