
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { allCountries } from '@/data/countries';

interface CountryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CountryDialog({ open, onOpenChange }: CountryDialogProps) {
  const { user, updateUserProfile } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState(user?.country || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user || !selectedCountry) return;
    
    setLoading(true);
    try {
      const country = allCountries.find(c => c.name === selectedCountry);
      const currency = country?.currency || 'USD';
      const currencySymbol = country?.symbol || '$';

      // Update via Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          country: selectedCountry,
          currency,
          currency_symbol: currencySymbol
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      updateUserProfile?.({
        ...user,
        country: selectedCountry,
        currency,
        currencySymbol
      });

      toast.success('Country updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating country:', error);
      toast.error('Failed to update country');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Country</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
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
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !selectedCountry}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
