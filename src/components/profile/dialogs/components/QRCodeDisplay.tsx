
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Copy } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  secret: string;
}

export function QRCodeDisplay({ qrCodeUrl, secret }: QRCodeDisplayProps) {
  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success('Secret key copied to clipboard');
  };

  return (
    <>
      <div className="text-center">
        <Card className="inline-block p-4">
          <CardContent className="p-0">
            <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
              <QrCode className="h-24 w-24 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <p className="text-sm text-muted-foreground mt-2">
          Scan this QR code with Google Authenticator, Authy, or similar app
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          QR Code URL: {qrCodeUrl}
        </p>
      </div>

      <div>
        <Label>Manual Entry Key</Label>
        <div className="flex gap-2">
          <Input value={secret} readOnly className="font-mono" />
          <Button variant="outline" onClick={copySecret}>
            Copy
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Use this key if you can't scan the QR code
        </p>
      </div>
    </>
  );
}
