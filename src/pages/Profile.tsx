
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Check, AlertTriangle } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  
  if (!user) {
    return null;
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>
      
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-axiom-primary to-axiom-secondary" />
        <CardHeader className="relative pb-0">
          <div className="absolute -top-16 left-6 ring-4 ring-background">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent className="pt-10 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" size="sm">
              Edit Profile
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {user.kycVerified ? (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex gap-1 items-center">
                <Check className="h-3 w-3" /> Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="flex gap-1 items-center">
                <AlertTriangle className="h-3 w-3" /> Unverified
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-axiom-primary" />
            <span className="text-sm text-muted-foreground">Member since {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="account">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">Full Name</div>
                  <div className="font-medium">{user.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{user.email}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">KYC Status</div>
                  <div className="font-medium">
                    {user.kycVerified ? 'Verified' : 'Not Verified'}
                    {!user.kycVerified && (
                      <Button variant="link" className="text-axiom-primary p-0 ml-2 h-auto">
                        Complete Verification
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Account Type</div>
                  <div className="font-medium">Individual</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Password</div>
                    <div className="text-sm text-muted-foreground">Last changed 30 days ago</div>
                  </div>
                  <Button variant="outline" size="sm">Change Password</Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">Not enabled</div>
                  </div>
                  <Button variant="outline" size="sm">Enable 2FA</Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Session Management</div>
                    <div className="text-sm text-muted-foreground">1 active session</div>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
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
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-muted-foreground">Receive important alerts on your device</div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Language & Region</div>
                    <div className="text-sm text-muted-foreground">English (United States)</div>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Button variant="destructive" onClick={logout}>
        Log Out
      </Button>
    </div>
  );
}
