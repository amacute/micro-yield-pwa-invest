
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Loader } from '@/components/common/Loader';
import { Copy, Upload, Check } from 'lucide-react';

interface P2PDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  cryptoAddress: string;
  cryptoNetwork: string;
}

export function P2PPayment() {
  const [activeTab, setActiveTab] = useState<string>('bank');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // Mock P2P details (in a real app, this would come from an API)
  const p2pDetails: P2PDetails = {
    bankName: "First Bank",
    accountNumber: "1234567890",
    accountName: "John Doe",
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
    
    if (!paymentProof) {
      toast.error('Please upload payment proof');
      return;
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!referenceNumber) {
      toast.error('Please enter a reference number');
      return;
    }
    
    setIsLoading(true);
    try {
      // In a real app, you would upload the proof to your server
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConfirmed(true);
      toast.success('Payment proof submitted successfully. Waiting for confirmation.');
    } catch (error) {
      toast.error('Failed to submit payment proof');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPayment = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an admin action
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Payment confirmed successfully!');
      // Reset form
      setPaymentProof(null);
      setProofPreview('');
      setReferenceNumber('');
      setPaymentAmount('');
      setIsConfirmed(false);
    } catch (error) {
      toast.error('Failed to confirm payment');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>P2P Payment</CardTitle>
        <CardDescription>
          Make a payment to your assigned P2P account and upload proof
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bank" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
            <TabsTrigger value="crypto">Crypto (USDT)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bank">
            <div className="space-y-4">
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
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    disabled={isLoading || isConfirmed}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Number / Transaction ID</Label>
                  <Input
                    id="reference"
                    placeholder="Enter reference number"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    disabled={isLoading || isConfirmed}
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
                      disabled={isLoading || isConfirmed}
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

                {!isConfirmed ? (
                  <Button 
                    type="submit" 
                    disabled={isLoading || !paymentProof || !referenceNumber || !paymentAmount} 
                    className="w-full"
                  >
                    {isLoading ? <Loader size="small" color="text-white" /> : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Payment Proof
                      </>
                    )}
                  </Button>
                ) : (
                  // This button would only be visible to admins in a real app
                  <Button 
                    type="button" 
                    onClick={confirmPayment}
                    disabled={isLoading} 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? <Loader size="small" color="text-white" /> : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Confirm Payment Received
                      </>
                    )}
                  </Button>
                )}
              </form>
            </div>
          </TabsContent>
          
          <TabsContent value="crypto">
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex flex-col gap-1">
                  <Label>USDT Address (TRC-20)</Label>
                  <div className="flex items-center gap-2">
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
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    disabled={isLoading || isConfirmed}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="crypto-txid">Transaction Hash / TxID</Label>
                  <Input
                    id="crypto-txid"
                    placeholder="Enter transaction hash"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    disabled={isLoading || isConfirmed}
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
                      disabled={isLoading || isConfirmed}
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

                {!isConfirmed ? (
                  <Button 
                    type="submit" 
                    disabled={isLoading || !paymentProof || !referenceNumber || !paymentAmount} 
                    className="w-full"
                  >
                    {isLoading ? <Loader size="small" color="text-white" /> : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Payment Proof
                      </>
                    )}
                  </Button>
                ) : (
                  // This button would only be visible to admins in a real app
                  <Button 
                    type="button" 
                    onClick={confirmPayment}
                    disabled={isLoading} 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? <Loader size="small" color="text-white" /> : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Confirm Payment Received
                      </>
                    )}
                  </Button>
                )}
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
