
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { allCountries } from '@/data/countries';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    country: user?.country || '',
    currency: user?.currency || 'USD'
  });
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'passport' | 'profile') => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'passport') {
        setPassportFile(file);
      } else {
        setProfileImageFile(file);
      }
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    
    if (error) throw error;
    return data;
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let passportUrl = user.passportUrl;
      let profileImageUrl = user.profileImageUrl;

      // Upload passport if new file selected
      if (passportFile) {
        const passportPath = `passports/${user.id}/${Date.now()}_${passportFile.name}`;
        await uploadFile(passportFile, 'documents', passportPath);
        const { data } = supabase.storage.from('documents').getPublicUrl(passportPath);
        passportUrl = data.publicUrl;
      }

      // Upload profile image if new file selected
      if (profileImageFile) {
        const imagePath = `profiles/${user.id}/${Date.now()}_${profileImageFile.name}`;
        await uploadFile(profileImageFile, 'profiles', imagePath);
        const { data } = supabase.storage.from('profiles').getPublicUrl(imagePath);
        profileImageUrl = data.publicUrl;
      }

      // Get currency symbol
      const selectedCountry = allCountries.find(c => c.name === profileData.country);
      const currencySymbol = selectedCountry?.symbol || '$';

      // Update user data
      const { error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          phone: profileData.phone,
          country: profileData.country,
          currency: profileData.currency,
          currency_symbol: currencySymbol,
          passport_url: passportUrl,
          profile_image_url: profileImageUrl
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state
      await updateUser({
        ...user,
        name: profileData.name,
        phone: profileData.phone,
        country: profileData.country,
        currency: profileData.currency,
        currencySymbol: currencySymbol,
        passportUrl,
        profileImageUrl
      });

      toast.success('Profile updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Profile Image Upload */}
          <div>
            <Label className="text-sm mb-2 block">Profile Picture</Label>
            <Card className="border-dashed border-2">
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'profile')}
                      className="hidden"
                      id="profile-upload"
                    />
                    <Label htmlFor="profile-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </span>
                      </Button>
                    </Label>
                    {profileImageFile && (
                      <p className="text-sm text-green-600 mt-2">
                        New image selected: {profileImageFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={profileData.country} onValueChange={(value) => {
                const country = allCountries.find(c => c.name === value);
                setProfileData({
                  ...profileData, 
                  country: value,
                  currency: country?.currency || 'USD'
                });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {allCountries.map(country => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={profileData.currency}
                readOnly
                placeholder="Currency"
              />
            </div>
          </div>

          {/* Passport Upload */}
          <div>
            <Label className="text-sm mb-2 block">Passport/ID Document</Label>
            <Card className="border-dashed border-2">
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'passport')}
                      className="hidden"
                      id="passport-upload"
                    />
                    <Label htmlFor="passport-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Passport/ID
                        </span>
                      </Button>
                    </Label>
                    {passportFile ? (
                      <p className="text-sm text-green-600 mt-2">
                        Selected: {passportFile.name}
                      </p>
                    ) : user?.passportUrl ? (
                      <p className="text-sm text-muted-foreground mt-2">
                        Document already uploaded
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">
                        Upload your passport or government-issued ID
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
