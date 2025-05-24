
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasswordDialog({ open, onOpenChange }: PasswordDialogProps) {
  const { updatePassword } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      await updatePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      onOpenChange(false);
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to change password. Please check your current password.');
      console.error(error);
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and a new secure password.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isChangingPassword}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handlePasswordChange}
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
          >
            {isChangingPassword ? 'Saving...' : 'Change Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
