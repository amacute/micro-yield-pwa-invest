
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { CreditCard, Bitcoin, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function WithdrawalOptions() {
  const [amount, setAmount] = useState<string>('');
  const [withdrawalAddress, setWithdrawalAddress] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const { user } = useAuth();
  
  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(amount) > (user?.walletBalance || 0)) {
      toast.error('Insufficient funds in your wallet');
      return;
    }

    // Check if user has made a deposit
    if (!user?.lastDepositTime) {
      toast.error('You must make a deposit before you can withdraw funds');
      return;
    }

    toast.success(`Withdrawal of ${user?.currencySymbol}${parseFloat(amount).toFixed(2)} initiated successfully!`);
    setAmount('');
  };

  const handleDepositRedirect = () => {
    // This will be handled by parent component
    window.location.hash = 'deposit';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw Funds</CardTitle>
        <CardDescription>Choose your preferred withdrawal method</CardDescription>
      </CardHeader>
      <CardContent>
        {!user?.lastDepositTime && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must make a deposit before you can withdraw funds.{' '}
              <Button variant="link" className="p-0 h-auto" onClick={handleDepositRedirect}>
                Make a deposit now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="bank" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="bank">
              <CreditCard className="h-4 w-4 mr-2" />
              Bank Transfer
            </TabsTrigger>
            <TabsTrigger value="crypto">
              <Bitcoin className="h-4 w-4 mr-2" />
              Cryptocurrency
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bank" className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="amount">Amount</label>
              <Input 
                id="amount" 
                type="number" 
                min="10" 
                placeholder="Enter amount" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!user?.lastDepositTime}
              />
              <p className="text-xs text-muted-foreground">
                Available balance: {user?.currencySymbol}{user?.walletBalance.toFixed(2) || '0.00'}
              </p>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="bank-name">Bank Name</label>
              <Input 
                id="bank-name" 
                placeholder="Enter bank name" 
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                disabled={!user?.lastDepositTime}
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="account-name">Account Holder Name</label>
              <Input 
                id="account-name" 
                placeholder="Enter account holder name" 
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                disabled={!user?.lastDepositTime}
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="account-number">Account Number</label>
              <Input 
                id="account-number" 
                placeholder="Enter account number" 
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                disabled={!user?.lastDepositTime}
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleWithdraw}
              disabled={!amount || !bankName || !accountName || !accountNumber || !user?.lastDepositTime}
            >
              Withdraw to Bank
            </Button>
          </TabsContent>
          
          <TabsContent value="crypto" className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="crypto-amount">Amount</label>
              <Input 
                id="crypto-amount" 
                type="number" 
                min="10" 
                placeholder="Enter amount" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!user?.lastDepositTime}
              />
              <p className="text-xs text-muted-foreground">
                Available balance: {user?.currencySymbol}{user?.walletBalance.toFixed(2) || '0.00'}
              </p>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Select Cryptocurrency</label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start" disabled={!user?.lastDepositTime}>
                  <Bitcoin className="h-4 w-4 mr-2" />
                  Bitcoin (BTC)
                </Button>
                <Button variant="outline" className="justify-start" disabled={!user?.lastDepositTime}>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#627EEA"/>
                  </svg>
                  Ethereum (ETH)
                </Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="wallet-address">Wallet Address</label>
              <Input 
                id="wallet-address" 
                placeholder="Enter your wallet address" 
                value={withdrawalAddress}
                onChange={(e) => setWithdrawalAddress(e.target.value)}
                disabled={!user?.lastDepositTime}
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleWithdraw}
              disabled={!amount || !withdrawalAddress || !user?.lastDepositTime}
            >
              Withdraw to Wallet
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
