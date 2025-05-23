
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

interface CountryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// List of countries with their currencies
const countryOptions = [
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: '$' },
  { code: 'AU', name: 'Australia', currency: 'AUD', symbol: '$' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', symbol: '₦' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', symbol: '₵' },
  { code: 'KE', name: 'Kenya', currency: 'KES', symbol: 'KSh' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', symbol: 'R' },
  { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' }
];

export function CountryDialog({ open, onOpenChange }: CountryDialogProps) {
  const { user, updateUserProfile } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState(user?.country || 'US');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveChanges = async () => {
    if (!selectedCountry) {
      toast.error('Please select a country');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would update the user's profile in the database
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find the selected country details
      const country = countryOptions.find(c => c.code === selectedCountry);
      
      if (updateUserProfile && country) {
        updateUserProfile({
          country: country.code,
          currency: country.currency,
          currencySymbol: country.symbol
        });
      }
      
      toast.success('Location and currency preferences updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update preferences');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Location & Currency</DialogTitle>
          <DialogDescription>
            Set your country and currency preferences. This helps us match you with nearby investors.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name} ({country.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              We match you with investors from the same country when possible
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Preferred Currency</Label>
            <div className="p-3 bg-muted rounded-md flex items-center justify-between">
              <span className="text-sm">
                {countryOptions.find(c => c.code === selectedCountry)?.currency || 'USD'}
              </span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {countryOptions.find(c => c.code === selectedCountry)?.symbol || '$'}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSaveChanges} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
