
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell } from 'lucide-react';
import { NotificationsDialog } from '../dialogs/NotificationsDialog';

interface NotificationsTabProps {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  onNotificationChange: (key: string, value: boolean) => void;
}

export function NotificationsTab({
  emailNotifications,
  pushNotifications,
  smsNotifications,
  marketingEmails,
  onNotificationChange
}: NotificationsTabProps) {
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowNotificationsDialog(true)}
          >
            Customize
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={(checked) => onNotificationChange('emailNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get real-time alerts in your browser
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={(checked) => onNotificationChange('pushNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive critical alerts via SMS
              </p>
            </div>
            <Switch
              id="sms-notifications"
              checked={smsNotifications}
              onCheckedChange={(checked) => onNotificationChange('smsNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketing-emails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive news and promotional content
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={marketingEmails}
              onCheckedChange={(checked) => onNotificationChange('marketingEmails', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <NotificationsDialog 
        open={showNotificationsDialog} 
        onOpenChange={setShowNotificationsDialog} 
      />
    </div>
  );
}
