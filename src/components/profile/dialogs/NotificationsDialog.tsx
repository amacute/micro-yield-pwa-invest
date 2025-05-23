
import { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
  const [emailNotifications, setEmailNotifications] = useState({
    marketing: true,
    security: true,
    account: true
  });
  
  const [pushNotifications, setPushNotifications] = useState({
    newOpportunities: true,
    paymentConfirmations: true,
    statusUpdates: true
  });
  
  const handleSaveNotifications = () => {
    // In a real application, this would save notification preferences
    toast.success('Notification preferences updated');
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Customize how and when you receive notifications.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <h3 className="font-medium text-lg mb-2">Email Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-normal">Marketing Updates</Label>
                  <p className="text-sm text-muted-foreground">Receive information about new products and features</p>
                </div>
                <Switch 
                  checked={emailNotifications.marketing} 
                  onCheckedChange={(checked) => 
                    setEmailNotifications({...emailNotifications, marketing: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-normal">Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications about account security</p>
                </div>
                <Switch 
                  checked={emailNotifications.security}
                  onCheckedChange={(checked) => 
                    setEmailNotifications({...emailNotifications, security: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-normal">Account Updates</Label>
                  <p className="text-sm text-muted-foreground">Receive updates about your account activity</p>
                </div>
                <Switch 
                  checked={emailNotifications.account}
                  onCheckedChange={(checked) => 
                    setEmailNotifications({...emailNotifications, account: checked})
                  }
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">Push Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-normal">New Investment Opportunities</Label>
                  <p className="text-sm text-muted-foreground">Be notified when new investments are available</p>
                </div>
                <Switch 
                  checked={pushNotifications.newOpportunities}
                  onCheckedChange={(checked) => 
                    setPushNotifications({...pushNotifications, newOpportunities: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-normal">Payment Confirmations</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications when payments are processed</p>
                </div>
                <Switch 
                  checked={pushNotifications.paymentConfirmations}
                  onCheckedChange={(checked) => 
                    setPushNotifications({...pushNotifications, paymentConfirmations: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-normal">Status Updates</Label>
                  <p className="text-sm text-muted-foreground">Be notified about changes to your investments</p>
                </div>
                <Switch 
                  checked={pushNotifications.statusUpdates}
                  onCheckedChange={(checked) => 
                    setPushNotifications({...pushNotifications, statusUpdates: checked})
                  }
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSaveNotifications}
          >
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
