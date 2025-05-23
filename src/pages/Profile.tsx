
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Check, AlertTriangle, Copy, Users } from 'lucide-react';
import { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Profile() {
  const { user, logout, updatePassword } = useAuth();
  const navigate = useNavigate();
  
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // 2FA states
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  // Language & region states
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [selectedRegion, setSelectedRegion] = useState('united-states');
  
  // Notification states
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
  
  // Generate a referral link
  const referralLink = `https://axiomify.com/ref/${user?.id}`;
  
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

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      await updatePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setShowPasswordDialog(false);
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to change password. Please make sure your current password is correct.');
      console.error(error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggle2FA = () => {
    // In a real application, this would initiate 2FA setup or removal
    setIs2FAEnabled(!is2FAEnabled);
    if (!is2FAEnabled) {
      toast.success('2FA enabled successfully');
    } else {
      toast.info('2FA disabled');
    }
    setShow2FADialog(false);
  };

  const handleSaveLanguage = () => {
    // In a real application, this would save the language and region settings
    toast.success('Language and region settings updated');
    setShowLanguageDialog(false);
  };

  const handleSaveNotifications = () => {
    // In a real application, this would save notification preferences
    toast.success('Notification preferences updated');
    setShowNotificationDialog(false);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard');
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
                      <Button 
                        variant="link" 
                        className="text-axiom-primary p-0 ml-2 h-auto"
                        onClick={() => navigate('/wallet')}
                      >
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPasswordDialog(true)}
                  >
                    Change Password
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">
                      {is2FAEnabled ? 'Enabled' : 'Not enabled'}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShow2FADialog(true)}
                  >
                    {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </Button>
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
        </TabsContent>
      </Tabs>
      
      <Button variant="destructive" onClick={logout}>
        Log Out
      </Button>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password.
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
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handlePasswordChange}
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            >
              {isChangingPassword ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{is2FAEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {is2FAEnabled 
                ? 'Enter your verification code to disable 2FA'
                : 'Enhance your account security by enabling two-factor authentication'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {!is2FAEnabled ? (
              <>
                <div className="bg-muted p-4 rounded-md mb-4">
                  <p className="text-sm mb-2">1. Scan this QR code with your authenticator app</p>
                  <div className="bg-white p-2 rounded-md w-48 h-48 mx-auto mb-4">
                    {/* This would be a QR code in a real implementation */}
                    <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <p className="text-sm text-gray-500">QR Code Placeholder</p>
                    </div>
                  </div>
                  <p className="text-sm">2. Enter the verification code from your app</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                </div>
              </>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleToggle2FA}
              disabled={verificationCode.length !== 6}
            >
              {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Language Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Language & Region</DialogTitle>
            <DialogDescription>
              Choose your preferred language and region.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="region">Region</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="united-states">United States</SelectItem>
                  <SelectItem value="united-kingdom">United Kingdom</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                  <SelectItem value="australia">Australia</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="africa">Africa</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleSaveLanguage}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Referral Dialog */}
      <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Refer Friends & Earn</DialogTitle>
            <DialogDescription>
              Invite your friends to join Axiomify and earn a 15% bonus on their investments.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-md">
              <Label className="text-sm mb-2 block">Your Referral Link</Label>
              <div className="flex items-center gap-2">
                <Input value={referralLink} readOnly className="text-sm" />
                <Button size="sm" variant="outline" onClick={copyReferralLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-md border border-dashed">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-10 w-10 text-axiom-primary mx-auto mb-2" />
                  <h3 className="font-medium mb-1">Invite & Earn</h3>
                  <p className="text-sm text-muted-foreground">You'll receive 15% of your friend's first investment</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  // This would open an email share dialog in a real application
                  toast.success('Email sharing initiated');
                }}
              >
                Share via Email
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  // This would open a social media share dialog in a real application
                  toast.success('Social media sharing initiated');
                }}
              >
                Share via Social
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
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
    </div>
  );
}
