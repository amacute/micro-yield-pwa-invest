
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bitcoin, Coins, Copy, Shield } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { getCryptoAddress, validateCryptoAddress } from '@/config/crypto';

export function CryptoOptions() {
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [amount, setAmount] = useState('');
  const [userAddress, setUserAddress] = useState('');

  const cryptoOptions = [
    { value: 'bitcoin', label: 'Bitcoin (BTC)', icon: Bitcoin },
    { value: 'ethereum', label: 'Ethereum (ETH)', icon: Coins },
    { value: 'litecoin', label: 'Litecoin (LTC)', icon: Coins }
  ];

  const depositAddress = getCryptoAddress(selectedCrypto);

  const copyAddress = () => {
    if (depositAddress) {
      navigator.clipboard.writeText(depositAddress);
      toast.success('Address copied to clipboard');
    }
  };

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!userAddress) {
      toast.error('Please enter your wallet address');
      return;
    }

    if (!validateCryptoAddress(selectedCrypto, userAddress)) {
      toast.error('Please enter a valid wallet address for ' + selectedCrypto);
      return;
    }

    toast.success(`Crypto deposit request submitted for ${amount} ${selectedCrypto.toUpperCase()}`);
    setAmount('');
    setUserAddress('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bitcoin className="h-5 w-5" />
          Cryptocurrency Deposit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Secure Crypto Processing</span>
          </div>
          <p className="text-xs text-blue-700">
            All cryptocurrency transactions are processed through secure, validated addresses with enhanced security measures.
          </p>
        </div>

        <div>
          <Label>Select Cryptocurrency</Label>
          <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cryptoOptions.map((crypto) => (
                <SelectItem key={crypto.value} value={crypto.value}>
                  <div className="flex items-center gap-2">
                    <crypto.icon className="h-4 w-4" />
                    {crypto.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Amount to Deposit</Label>
          <Input
            type="number"
            step="0.00000001"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <Label>Your {selectedCrypto.toUpperCase()} Wallet Address</Label>
          <Input
            placeholder={`Enter your ${selectedCrypto} address`}
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This is where refunds will be sent if needed
          </p>
        </div>

        <div>
          <Label>Send Payment To</Label>
          <div className="flex items-center gap-2 p-3 bg-muted rounded border">
            <code className="flex-1 text-sm break-all">{depositAddress}</code>
            <Button size="sm" variant="outline" onClick={copyAddress}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Send your {selectedCrypto.toUpperCase()} to this secure address
          </p>
        </div>

        <Button onClick={handleDeposit} className="w-full" size="lg">
          Submit Deposit Request
        </Button>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-xs text-yellow-800">
            ⚠️ Please double-check the address before sending. Cryptocurrency transactions are irreversible.
            Processing time: 1-6 confirmations depending on network congestion.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
