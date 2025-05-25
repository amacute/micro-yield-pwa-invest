
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bitcoin, Copy, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface CryptoNetwork {
  id: string;
  name: string;
  symbol: string;
  network: string;
  address: string;
  fee: number;
  min_amount: number;
}

export function CryptoOptions() {
  const [cryptoNetworks, setCryptoNetworks] = useState<CryptoNetwork[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    loadCryptoNetworks();
  }, []);

  const loadCryptoNetworks = () => {
    // Mock crypto networks data - in production this would come from admin settings
    const mockNetworks: CryptoNetwork[] = [
      {
        id: '1',
        name: 'USDT',
        symbol: 'USDT',
        network: 'TRC-20 (Tron)',
        address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
        fee: 1,
        min_amount: 10
      },
      {
        id: '2',
        name: 'USDT',
        symbol: 'USDT',
        network: 'BEP-20 (BSC)',
        address: '0x742d35Cc6634C0532925a3b8D654E07E22C5e6D2',
        fee: 0.5,
        min_amount: 10
      },
      {
        id: '3',
        name: 'USDT',
        symbol: 'USDT',
        network: 'ERC-20 (Ethereum)',
        address: '0x742d35Cc6634C0532925a3b8D654E07E22C5e6D2',
        fee: 5,
        min_amount: 20
      },
      {
        id: '4',
        name: 'Bitcoin',
        symbol: 'BTC',
        network: 'Bitcoin Network',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        fee: 0.0005,
        min_amount: 0.001
      }
    ];
    setCryptoNetworks(mockNetworks);
  };

  const selectedCrypto = cryptoNetworks.find(crypto => crypto.id === selectedNetwork);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied to clipboard');
  };

  const handleDeposit = () => {
    if (!selectedNetwork || !amount) {
      toast.error('Please select a network and enter an amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (selectedCrypto && numAmount < selectedCrypto.min_amount) {
      toast.error(`Minimum amount is ${selectedCrypto.min_amount} ${selectedCrypto.symbol}`);
      return;
    }

    toast.success('Deposit instructions sent. Please send the exact amount to the provided address.');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5" />
            Cryptocurrency Deposit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Network Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Network</label>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger>
                <SelectValue placeholder="Choose cryptocurrency network" />
              </SelectTrigger>
              <SelectContent>
                {cryptoNetworks.map((crypto) => (
                  <SelectItem key={crypto.id} value={crypto.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{crypto.symbol}</span>
                      <span className="text-muted-foreground">({crypto.network})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              step="0.000001"
            />
            {selectedCrypto && (
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: {selectedCrypto.min_amount} {selectedCrypto.symbol} | 
                Network fee: {selectedCrypto.fee} {selectedCrypto.symbol}
              </p>
            )}
          </div>

          {/* Selected Network Details */}
          {selectedCrypto && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Deposit Address</h3>
                <Badge variant="outline">{selectedCrypto.network}</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-background rounded border">
                  <code className="flex-1 text-sm break-all">{selectedCrypto.address}</code>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(selectedCrypto.address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Network:</span>
                    <p className="font-medium">{selectedCrypto.network}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fee:</span>
                    <p className="font-medium">{selectedCrypto.fee} {selectedCrypto.symbol}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <h4 className="font-medium text-yellow-800 mb-2">Important Instructions:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Only send {selectedCrypto.symbol} to this address</li>
                    <li>• Make sure you're using the correct network ({selectedCrypto.network})</li>
                    <li>• Minimum deposit: {selectedCrypto.min_amount} {selectedCrypto.symbol}</li>
                    <li>• Deposits typically take 10-30 minutes to confirm</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={handleDeposit} 
            disabled={!selectedNetwork || !amount}
            className="w-full"
          >
            Generate Deposit Instructions
          </Button>
        </CardContent>
      </Card>

      {/* Network Information */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Networks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {cryptoNetworks.map((crypto) => (
              <div key={crypto.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Bitcoin className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">{crypto.symbol}</p>
                    <p className="text-sm text-muted-foreground">{crypto.network}</p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="text-muted-foreground">Min: {crypto.min_amount}</p>
                  <p className="text-muted-foreground">Fee: {crypto.fee}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
