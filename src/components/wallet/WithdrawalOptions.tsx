
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { CreditCard, Bitcoin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function WithdrawalOptions() {
  const [amount, setAmount] = useState<string>('');
  const [withdrawalAddress, setWithdrawalAddress] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [recommitSelected, setRecommitSelected] = useState(true);
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

    // Calculate recommitment amount (50% of withdrawal)
    const withdrawalAmount = parseFloat(amount);
    const recommitAmount = recommitSelected ? withdrawalAmount * 0.5 : 0;
    const actualWithdrawalAmount = withdrawalAmount - recommitAmount;
    
    toast.success(`Withdrawal of $${actualWithdrawalAmount.toFixed(2)} initiated successfully!${
      recommitSelected ? ` $${recommitAmount.toFixed(2)} has been recommitted for the next investment cycle.` : ''
    }`);
    
    setAmount('');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw Funds</CardTitle>
        <CardDescription>Choose your preferred withdrawal method</CardDescription>
      </CardHeader>
      <CardContent>
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
              />
              <p className="text-xs text-muted-foreground">Available balance: ${user?.walletBalance.toFixed(2) || '0.00'}</p>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <Checkbox 
                id="recommit" 
                checked={recommitSelected} 
                onCheckedChange={(checked) => setRecommitSelected(checked === true)}
              />
              <Label htmlFor="recommit" className="text-sm">
                Recommit 50% of withdrawal for next investment cycle
              </Label>
            </div>

            <div className="p-4 my-3 bg-muted rounded-lg">
              <p className="text-xs font-medium mb-1">Withdrawal Summary:</p>
              {amount && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total amount:</span>
                    <span>${parseFloat(amount || '0').toFixed(2)}</span>
                  </div>
                  {recommitSelected && (
                    <div className="flex justify-between text-sm">
                      <span>Amount recommitted (50%):</span>
                      <span>${(parseFloat(amount || '0') * 0.5).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-medium border-t pt-1 mt-1">
                    <span>Actual withdrawal:</span>
                    <span>${(parseFloat(amount || '0') * (recommitSelected ? 0.5 : 1)).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="bank-name">Bank Name</label>
              <Input 
                id="bank-name" 
                placeholder="Enter bank name" 
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="account-name">Account Holder Name</label>
              <Input 
                id="account-name" 
                placeholder="Enter account holder name" 
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="account-number">Account Number</label>
              <Input 
                id="account-number" 
                placeholder="Enter account number" 
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleWithdraw}
              disabled={!amount || !bankName || !accountName || !accountNumber}
            >
              Withdraw to Bank
            </Button>
          </TabsContent>
          
          <TabsContent value="crypto" className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="crypto-amount">Amount (USD)</label>
              <Input 
                id="crypto-amount" 
                type="number" 
                min="10" 
                placeholder="Enter amount in USD" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Available balance: ${user?.walletBalance.toFixed(2) || '0.00'}</p>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <Checkbox 
                id="recommit-crypto" 
                checked={recommitSelected} 
                onCheckedChange={(checked) => setRecommitSelected(checked === true)}
              />
              <Label htmlFor="recommit-crypto" className="text-sm">
                Recommit 50% of withdrawal for next investment cycle
              </Label>
            </div>

            <div className="p-4 my-3 bg-muted rounded-lg">
              <p className="text-xs font-medium mb-1">Withdrawal Summary:</p>
              {amount && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total amount:</span>
                    <span>${parseFloat(amount || '0').toFixed(2)}</span>
                  </div>
                  {recommitSelected && (
                    <div className="flex justify-between text-sm">
                      <span>Amount recommitted (50%):</span>
                      <span>${(parseFloat(amount || '0') * 0.5).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-medium border-t pt-1 mt-1">
                    <span>Actual withdrawal:</span>
                    <span>${(parseFloat(amount || '0') * (recommitSelected ? 0.5 : 1)).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Select Cryptocurrency</label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start">
                  <Bitcoin className="h-4 w-4 mr-2" />
                  Bitcoin (BTC)
                </Button>
                <Button variant="outline" className="justify-start">
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#627EEA"/>
                    <path d="M12.3735 3V9.6525L17.9963 12.165L12.3735 3Z" fill="white" fillOpacity="0.602"/>
                    <path d="M12.3735 3L6.75 12.165L12.3735 9.6525V3Z" fill="white"/>
                    <path d="M12.3735 16.4762V20.9964L18 13.2122L12.3735 16.4762Z" fill="white" fillOpacity="0.602"/>
                    <path d="M12.3735 20.9964V16.4754L6.75 13.2122L12.3735 20.9964Z" fill="white"/>
                    <path d="M12.3735 15.4297L17.9963 12.1649L12.3735 9.65479V15.4297Z" fill="white" fillOpacity="0.2"/>
                    <path d="M6.75 12.1649L12.3735 15.4297V9.65479L6.75 12.1649Z" fill="white" fillOpacity="0.602"/>
                  </svg>
                  Ethereum (ETH)
                </Button>
                <Button variant="outline" className="justify-start">
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#26A17B"/>
                    <path d="M15.9352 10.3475V14.0937H17.0223V9.26044H13.4316V14.0937H14.5188V10.3475H15.9352ZM12.2249 9.26044H8.45654V10.3475H9.87297V14.0937H10.9601V10.3475H12.3765V9.26044H12.2249ZM7.96117 13.0067H6.32129V9.26044H5.23413V14.0937H7.96117V13.0067Z" fill="white"/>
                  </svg>
                  USDT (Tether)
                </Button>
                <Button variant="outline" className="justify-start">
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#F0B90B"/>
                    <path d="M12 5.27273L13.6364 6.90909L9.27273 11.2727L7.63636 9.63636L12 5.27273Z" fill="white"/>
                    <path d="M14.7273 7.36364L16.3636 9L9 16.3636L7.36364 14.7273L14.7273 7.36364Z" fill="white"/>
                    <path d="M6.54545 10.0909L8.18182 11.7273L6.54545 13.3636L4.90909 11.7273L6.54545 10.0909Z" fill="white"/>
                    <path d="M17.4545 10.0909L19.0909 11.7273L12.3636 18.4545L10.7273 16.8182L17.4545 10.0909Z" fill="white"/>
                  </svg>
                  BNB
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
              />
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Make sure to double-check your wallet address before confirming the withdrawal. 
                Incorrect addresses can result in permanent loss of funds.
              </p>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleWithdraw}
              disabled={!amount || !withdrawalAddress}
            >
              Withdraw to Wallet
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
