
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Bitcoin } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

const cryptoNetworks = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: Bitcoin,
    networks: ['BTC']
  },
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    icon: () => (
      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
        T
      </div>
    ),
    networks: ['TRC-20', 'BEP-20', 'ERC-20']
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: () => (
      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
        E
      </div>
    ),
    networks: ['ERC-20']
  }
];

interface CryptoOptionsProps {
  type: 'deposit' | 'withdrawal';
}

export function CryptoOptions({ type }: CryptoOptionsProps) {
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoNetworks[0]);
  const [selectedNetwork, setSelectedNetwork] = useState(cryptoNetworks[0].networks[0]);
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const [amount, setAmount] = useState('');
  const [userAddress, setUserAddress] = useState('');

  useEffect(() => {
    fetchCryptoAddresses();
  }, []);

  const fetchCryptoAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_addresses')
        .select('*');
      
      if (error) throw error;
      
      const addressMap: Record<string, string> = {};
      data?.forEach(addr => {
        addressMap[`${addr.crypto_type}_${addr.network}`] = addr.address;
      });
      setAddresses(addressMap);
    } catch (error) {
      console.error('Error fetching crypto addresses:', error);
    }
  };

  const getAddress = () => {
    const key = `${selectedCrypto.id}_${selectedNetwork}`;
    return addresses[key] || 'Address not configured';
  };

  const copyAddress = () => {
    const address = getAddress();
    if (address !== 'Address not configured') {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    } else {
      toast.error('Address not available');
    }
  };

  const handleTransaction = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (type === 'withdrawal' && !userAddress) {
      toast.error('Please enter your wallet address');
      return;
    }

    toast.success(`${type === 'deposit' ? 'Deposit' : 'Withdrawal'} request submitted`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type === 'deposit' ? 'Crypto Deposit' : 'Crypto Withdrawal'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Crypto Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Select Cryptocurrency</label>
          <div className="grid grid-cols-1 gap-2">
            {cryptoNetworks.map(crypto => {
              const IconComponent = crypto.icon;
              return (
                <Button
                  key={crypto.id}
                  variant={selectedCrypto.id === crypto.id ? 'default' : 'outline'}
                  className="justify-start h-auto p-4"
                  onClick={() => {
                    setSelectedCrypto(crypto);
                    setSelectedNetwork(crypto.networks[0]);
                  }}
                >
                  <IconComponent />
                  <div className="ml-3 text-left">
                    <div className="font-medium">{crypto.name}</div>
                    <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Network Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Select Network</label>
          <div className="flex gap-2 flex-wrap">
            {selectedCrypto.networks.map(network => (
              <Button
                key={network}
                variant={selectedNetwork === network ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedNetwork(network)}
              >
                {network}
              </Button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">Amount</label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {type === 'deposit' ? (
          /* Deposit Address */
          <div>
            <label className="text-sm font-medium mb-2 block">
              {selectedCrypto.symbol} {selectedNetwork} Deposit Address
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={getAddress()}
                readOnly
                className="font-mono text-sm"
              />
              <Button size="icon" variant="outline" onClick={copyAddress}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Send only {selectedCrypto.symbol} to this address via {selectedNetwork} network
            </p>
          </div>
        ) : (
          /* Withdrawal Address */
          <div>
            <label className="text-sm font-medium mb-2 block">
              Your {selectedCrypto.symbol} Wallet Address
            </label>
            <Input
              placeholder={`Enter your ${selectedCrypto.symbol} wallet address`}
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Make sure this address supports {selectedNetwork} network
            </p>
          </div>
        )}

        {/* Transaction Fee */}
        <div className="bg-muted p-3 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Network Fee:</span>
            <span>~0.001 {selectedCrypto.symbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Processing Time:</span>
            <span>10-30 minutes</span>
          </div>
        </div>

        <Button onClick={handleTransaction} className="w-full">
          {type === 'deposit' ? 'Confirm Deposit' : 'Withdraw'}
        </Button>
      </CardContent>
    </Card>
  );
}
