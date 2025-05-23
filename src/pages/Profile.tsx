
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AccountTab } from '@/components/profile/AccountTab';
import { SecurityTab } from '@/components/profile/SecurityTab';
import { PreferencesTab } from '@/components/profile/PreferencesTab';

export default function Profile() {
  const { logout } = useAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>
      
      <ProfileHeader />
      
      <Tabs defaultValue="account">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
        
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
        
        <TabsContent value="preferences">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
      
      <Button variant="destructive" onClick={logout}>
        Log Out
      </Button>
    </div>
  );
}
