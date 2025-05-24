
import { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { allCountries } from '@/data/countries';
import { supabase } from '@/integrations/supabase/client';

interface CountryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CountryDialog({ open, onOpenChange }: CountryDialogProps) {
  const { user, updateUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(user?.country || '');
  
  const filteredCountries = allCountries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSaveCountry = async () => {
    if (!user || !selectedCountry) return;
    
    const country = allCountries.find(c => c.name === selectedCountry);
    if (!country) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          country: selectedCountry,
          currency: country.currency,
          currency_symbol: country.symbol
        })
        .eq('id', user.id);

      if (error) throw error;

      await updateUser({
        ...user,
        country: selectedCountry,
        currency: country.currency,
        currencySymbol: country.symbol
      });

      toast.success('Country and currency updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating country:', error);
      toast.error('Failed to update country');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Country</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search countries..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {filteredCountries.map(country => (
                <Button
                  key={country.code}
                  variant={selectedCountry === country.name ? 'default' : 'ghost'}
                  className="w-full justify-between h-auto p-3"
                  onClick={() => setSelectedCountry(country.name)}
                >
                  <div className="text-left">
                    <div className="font-medium">{country.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {country.currency} ({country.symbol})
                    </div>
                  </div>
                  {selectedCountry === country.name && (
                    <div className="w-2 h-2 bg-current rounded-full" />
                  )}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCountry}
            disabled={!selectedCountry}
          >
            Save Country
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
