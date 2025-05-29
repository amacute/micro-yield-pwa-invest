
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { CreditCard, Bitcoin, Upload, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function DepositOptions() {
  const [amount, setAmount] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      setProofFile(file);
    }
  };

  const handleSubmitDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!accountName || !accountNumber || !bankName) {
      toast.error('Please fill in all bank details');
      return;
    }

    if (!proofFile) {
      toast.error('Please upload proof of payment');
      return;
    }

    try {
      setSubmitting(true);

      // Generate reference number
      const referenceNumber = `DEP${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create a transaction record instead of deposits
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          amount: parseFloat(amount),
          type: 'deposit',
          status: 'pending',
          description: `Bank deposit - ${referenceNumber}`
        });

      if (error) throw error;

      toast.success(`Deposit request submitted successfully! Reference: ${referenceNumber}`);
      
      // Reset form
      setAmount('');
      setAccountNumber('');
      setBankName('');
      setAccountName('');
      setProofFile(null);
      
    } catch (error) {
      console.error('Error submitting deposit:', error);
      toast.error('Failed to submit deposit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit Funds</CardTitle>
        <CardDescription>Add funds to your wallet to start P2P lending</CardDescription>
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
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-2">Bank Transfer Instructions</h4>
              <div className="text-sm space-y-1">
                <p><strong>Account Name:</strong> Axiomify Limited</p>
                <p><strong>Account Number:</strong> 1234567890</p>
                <p><strong>Bank:</strong> Global Bank</p>
                <p><strong>Sort Code:</strong> 12-34-56</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="amount">Deposit Amount</label>
                <Input 
                  id="amount" 
                  type="number" 
                  min="10" 
                  placeholder="Enter amount" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="sender-bank">Your Bank Name</label>
                <Input 
                  id="sender-bank" 
                  placeholder="Enter your bank name" 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="sender-name">Your Account Name</label>
                <Input 
                  id="sender-name" 
                  placeholder="Enter your account name" 
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="sender-account">Your Account Number</label>
                <Input 
                  id="sender-account" 
                  placeholder="Enter your account number" 
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="proof">Upload Proof of Payment</label>
                <Input 
                  id="proof" 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
                {proofFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    {proofFile.name}
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleSubmitDeposit}
              disabled={!amount || !bankName || !accountName || !accountNumber || !proofFile || submitting}
            >
              {submitting ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Deposit Request
                </>
              )}
            </Button>

            <div className="text-xs text-muted-foreground mt-4">
              <p>• Deposits are processed within 24 hours</p>
              <p>• Minimum deposit amount is $10</p>
              <p>• Please ensure the sender details match your account information</p>
            </div>
          </TabsContent>
          
          <TabsContent value="crypto" className="space-y-4">
            <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Cryptocurrency Deposit</h4>
              <div className="text-sm space-y-1">
                <p><strong>Bitcoin Address:</strong> bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</p>
                <p><strong>Ethereum Address:</strong> 0x742d35Cc6834C0532925a3b8D5C9C3E8B9452a72</p>
              </div>
            </div>
            
            <div className="text-center py-8">
              <Bitcoin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Send Cryptocurrency</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Send your cryptocurrency to the address above and contact support with transaction details
              </p>
              <Button variant="outline">Contact Support</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
