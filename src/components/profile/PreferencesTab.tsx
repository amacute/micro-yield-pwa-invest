
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralTab } from './tabs/GeneralTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { PrivacyTab } from './tabs/PrivacyTab';
import { SocialMediaTab } from './SocialMediaTab';
import { ReferralSystem } from './ReferralSystem';

export function PreferencesTab() {
  const { user } = useAuth();
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    darkMode: false,
    twoFactorAuth: user?.twoFactorEnabled || false
  });

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList className="grid grid-cols-5">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="social">Social Media</TabsTrigger>
        <TabsTrigger value="referrals">Referrals</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <GeneralTab 
          darkMode={preferences.darkMode}
          onDarkModeChange={(value) => handlePreferenceChange('darkMode', value)}
        />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationsTab 
          emailNotifications={preferences.emailNotifications}
          pushNotifications={preferences.pushNotifications}
          smsNotifications={preferences.smsNotifications}
          marketingEmails={preferences.marketingEmails}
          onNotificationChange={handlePreferenceChange}
        />
      </TabsContent>

      <TabsContent value="social">
        <SocialMediaTab />
      </TabsContent>

      <TabsContent value="referrals">
        <ReferralSystem />
      </TabsContent>

      <TabsContent value="privacy">
        <PrivacyTab 
          twoFactorAuth={preferences.twoFactorAuth}
          onTwoFactorChange={(value) => handlePreferenceChange('twoFactorAuth', value)}
        />
      </TabsContent>
    </Tabs>
  );
}
