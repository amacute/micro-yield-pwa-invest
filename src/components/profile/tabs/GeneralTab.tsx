
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe, Palette } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CountryDialog } from '../dialogs/CountryDialog';
import { LanguageDialog } from '../dialogs/LanguageDialog';

interface GeneralTabProps {
  darkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
}

export function GeneralTab({ darkMode, onDarkModeChange }: GeneralTabProps) {
  const { user } = useAuth();
  const [showCountryDialog, setShowCountryDialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);

  return (
    <div className="space-y-4">
      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Regional Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Country/Region</h3>
              <p className="text-sm text-muted-foreground">
                Current: {user?.country || 'Not selected'}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowCountryDialog(true)}
            >
              Change Country
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Language</h3>
              <p className="text-sm text-muted-foreground">
                Current: English (US)
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowLanguageDialog(true)}
            >
              Change Language
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Currency</h3>
              <p className="text-sm text-muted-foreground">
                Current: {user?.currency} ({user?.currencySymbol})
              </p>
            </div>
            <Button variant="outline" disabled>
              Auto-detected
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={onDarkModeChange}
            />
          </div>
        </CardContent>
      </Card>

      <CountryDialog 
        open={showCountryDialog} 
        onOpenChange={setShowCountryDialog} 
      />
      
      <LanguageDialog 
        open={showLanguageDialog} 
        onOpenChange={setShowLanguageDialog} 
      />
    </div>
  );
}
