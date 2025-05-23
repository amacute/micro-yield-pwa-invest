
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LanguageDialog } from '@/components/profile/dialogs/LanguageDialog';
import { NotificationsDialog } from '@/components/profile/dialogs/NotificationsDialog';
import { ReferralDialog } from '@/components/profile/dialogs/ReferralDialog';
import { CountryDialog } from '@/components/profile/dialogs/CountryDialog';
import { GlobeIcon, BellIcon, Users, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useInvestment } from '@/contexts/InvestmentContext';

export function PreferencesTab() {
  const { user } = useAuth();
  const { getUserReferralLink } = useInvestment();

  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [showCountryDialog, setShowCountryDialog] = useState(false);

  if (!user) return null;
  
  // Get user's country and currency or use defaults
  const userCountry = user.country || 'United States';
  const userCurrency = user.currency || 'USD';

  // Get the user's referral link
  const referralLink = getUserReferralLink(user.id);
  const shortenedLink = referralLink.substring(0, 25) + '...';
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-axiom-primary/10 rounded-full">
                  <GlobeIcon className="h-4 w-4 text-axiom-primary" />
                </div>
                <div>
                  <div className="font-medium">Language & Region</div>
                  <div className="text-sm text-muted-foreground">English (US)</div>
                </div>
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
              <div className="flex items-center gap-3">
                <div className="p-2 bg-axiom-primary/10 rounded-full">
                  <MapPin className="h-4 w-4 text-axiom-primary" />
                </div>
                <div>
                  <div className="font-medium">Country & Currency</div>
                  <div className="text-sm text-muted-foreground">{userCountry} ({userCurrency})</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCountryDialog(true)}
              >
                Change
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-axiom-primary/10 rounded-full">
                  <BellIcon className="h-4 w-4 text-axiom-primary" />
                </div>
                <div>
                  <div className="font-medium">Notifications</div>
                  <div className="text-sm text-muted-foreground">Email, Push</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowNotificationsDialog(true)}
              >
                Configure
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-axiom-primary/10 rounded-full">
                  <Users className="h-4 w-4 text-axiom-primary" />
                </div>
                <div>
                  <div className="font-medium">Invite Friends</div>
                  <div className="text-sm text-muted-foreground">{shortenedLink}</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowReferralDialog(true)}
              >
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <LanguageDialog 
        open={showLanguageDialog} 
        onOpenChange={setShowLanguageDialog} 
      />
      
      <NotificationsDialog 
        open={showNotificationsDialog} 
        onOpenChange={setShowNotificationsDialog} 
      />
      
      <ReferralDialog 
        open={showReferralDialog} 
        onOpenChange={setShowReferralDialog} 
      />

      <CountryDialog
        open={showCountryDialog}
        onOpenChange={setShowCountryDialog}
      />
    </>
  );
}
