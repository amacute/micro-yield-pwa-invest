
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { CreditCard, Bitcoin, Copy, Upload, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/common/Loader';

export function DepositOptions() {
  const [amount, setAmount] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>('bank');
  const [isLoading, setIsLoading] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Mock P2P details (in a real app, this would come from an API)
  const p2pDetails = {
    bankName: "First Bank",
    accountNumber: "1234567890",
    accountName: "Axiomify Ltd",
    cryptoAddress: "TL7yzxcbeu8fqLH2hWNVuD3S5J1YUZUJVW",
    cryptoNetwork: "USDT (TRC-20)"
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProof(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!paymentProof) {
      toast.error('Please upload payment proof');
      return;
    }

    if (!referenceNumber) {
      toast.error('Please enter a reference number or transaction ID');
      return;
    }
    
    setIsLoading(true);
    try {
      // In a real app, you would upload the proof to your server
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
      toast.success('Deposit request submitted successfully! Funds will be credited once confirmed.');
    } catch (error) {
      toast.error('Failed to submit deposit request');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setReferenceNumber('');
    setPaymentProof(null);
    setProofPreview('');
    setIsSubmitted(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit Funds</CardTitle>
        <CardDescription>Choose your preferred deposit method</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bank" value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="bank">
              <CreditCard className="h-4 w-4 mr-2" />
              Bank Transfer
            </TabsTrigger>
            <TabsTrigger value="crypto">
              <Bitcoin className="h-4 w-4 mr-2" />
              USDT (Tether)
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bank" className="space-y-4">
            {!isSubmitted ? (
              <>
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Bank Name</Label>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p2pDetails.bankName}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => handleCopy(p2pDetails.bankName)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label>Account Number</Label>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p2pDetails.accountNumber}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => handleCopy(p2pDetails.accountNumber)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label>Account Name</Label>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p2pDetails.accountName}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => handleCopy(p2pDetails.accountName)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference Number / Transaction ID</Label>
                    <Input
                      id="reference"
                      placeholder="Enter reference number"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="proof">Upload Payment Proof</Label>
                    <div className="grid gap-2">
                      <Input
                        id="proof"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload a screenshot of your payment receipt
                      </p>
                    </div>
                  </div>

                  {proofPreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Preview:</p>
                      <div className="border rounded-md overflow-hidden">
                        <img 
                          src={proofPreview} 
                          alt="Payment Proof" 
                          className="max-w-full h-auto max-h-60 object-contain mx-auto"
                        />
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={isLoading || !paymentProof || !referenceNumber || !amount} 
                    className="w-full"
                  >
                    {isLoading ? <Loader size="small" color="text-white" /> : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Deposit Request
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-4 py-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-medium">Deposit Request Submitted</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your deposit request has been submitted successfully. Funds will be credited to your account once payment is confirmed.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={resetForm}
                >
                  Make Another Deposit
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="crypto" className="space-y-4">
            {!isSubmitted ? (
              <>
                <div className="bg-muted p-4 rounded-md space-y-4">
                  <div>
                    <Label>USDT Address (TRC-20)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium text-sm break-all">{p2pDetails.cryptoAddress}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 flex-shrink-0" 
                        onClick={() => handleCopy(p2pDetails.cryptoAddress)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Label>Network</Label>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p2pDetails.cryptoNetwork}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => handleCopy(p2pDetails.cryptoNetwork)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="crypto-amount">Amount (USDT)</Label>
                    <Input
                      id="crypto-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="crypto-txid">Transaction Hash / TxID</Label>
                    <Input
                      id="crypto-txid"
                      placeholder="Enter transaction hash"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="crypto-proof">Upload Payment Proof</Label>
                    <div className="grid gap-2">
                      <Input
                        id="crypto-proof"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload a screenshot of your transaction from wallet or exchange
                      </p>
                    </div>
                  </div>

                  {proofPreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Preview:</p>
                      <div className="border rounded-md overflow-hidden">
                        <img 
                          src={proofPreview} 
                          alt="Payment Proof" 
                          className="max-w-full h-auto max-h-60 object-contain mx-auto"
                        />
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={isLoading || !paymentProof || !referenceNumber || !amount} 
                    className="w-full"
                  >
                    {isLoading ? <Loader size="small" color="text-white" /> : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Deposit Request
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-4 py-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-medium">Deposit Request Submitted</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your deposit request has been submitted successfully. Funds will be credited to your account once payment is confirmed.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={resetForm}
                >
                  Make Another Deposit
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
