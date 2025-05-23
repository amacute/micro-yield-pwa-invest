
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NotificationsDialog } from '@/components/profile/dialogs/NotificationsDialog';
import { LanguageDialog } from '@/components/profile/dialogs/LanguageDialog';
import { ReferralDialog } from '@/components/profile/dialogs/ReferralDialog';

export function PreferencesTab() {
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">Receive updates about new opportunities</div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowNotificationDialog(true)}
              >
                Configure
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Push Notifications</div>
                <div className="text-sm text-muted-foreground">Receive important alerts on your device</div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowNotificationDialog(true)}
              >
                Configure
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Language & Region</div>
                <div className="text-sm text-muted-foreground">English (United States)</div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowLanguageDialog(true)}
              >
                Change
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Referrals</div>
                <div className="text-sm text-muted-foreground">Invite friends and earn 15% bonus</div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowReferralDialog(true)}
              >
                Invite Friends
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <NotificationsDialog 
        open={showNotificationDialog} 
        onOpenChange={setShowNotificationDialog} 
      />
      
      <LanguageDialog 
        open={showLanguageDialog} 
        onOpenChange={setShowLanguageDialog} 
      />
      
      <ReferralDialog 
        open={showReferralDialog} 
        onOpenChange={setShowReferralDialog} 
      />
    </>
  );
}
