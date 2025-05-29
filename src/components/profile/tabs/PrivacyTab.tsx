
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

interface PrivacyTabProps {
  twoFactorAuth: boolean;
  onTwoFactorChange: (value: boolean) => void;
}

export function PrivacyTab({ twoFactorAuth, onTwoFactorChange }: PrivacyTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="two-factor">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="two-factor"
              checked={twoFactorAuth}
              onCheckedChange={onTwoFactorChange}
            />
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Data & Privacy</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Download My Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Privacy Settings
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
