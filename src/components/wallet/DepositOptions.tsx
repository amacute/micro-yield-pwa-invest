
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { CreditCard, Bitcoin } from 'lucide-react';

export function DepositOptions() {
  const [amount, setAmount] = useState<string>('');
  
  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    toast.success(`Deposit of $${amount} initiated successfully!`);
    setAmount('');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit Funds</CardTitle>
        <CardDescription>Choose your preferred deposit method</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bank" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="bank">
              <CreditCard className="h-4 w-4 mr-2" />
              Bank / Card
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
            </div>
            
            <div className="grid grid-cols-2 gap-4 my-2">
              <Button variant="outline" onClick={() => setAmount('50')}>$50</Button>
              <Button variant="outline" onClick={() => setAmount('100')}>$100</Button>
              <Button variant="outline" onClick={() => setAmount('500')}>$500</Button>
              <Button variant="outline" onClick={() => setAmount('1000')}>$1000</Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="card">Card Number</label>
                <Input id="card" placeholder="1234 5678 9012 3456" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="expiry">Expiry Date</label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="cvv">CVV</label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </div>
              
              <Button className="w-full" onClick={handleDeposit}>Deposit Now</Button>
            </div>
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
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Wallet Address</p>
              <div className="bg-secondary p-2 rounded-md font-mono text-xs break-all">
                bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Send your cryptocurrency to this address. Funds will be credited after network confirmations.
              </p>
            </div>
            
            <Button className="w-full" onClick={handleDeposit}>
              Generate New Address
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
