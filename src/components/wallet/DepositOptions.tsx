import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { CreditCard, Bitcoin, Copy, Upload, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/common/Loader';
import { useAuth } from '@/contexts/AuthContext';
import { CryptoOptions } from '@/components/wallet/CryptoOptions';

export function DepositOptions() {
  const { user, updateUserProfile } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>('bank');
  const [isLoading, setIsLoading] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Live P2P details with WhatsApp contact
  const p2pDetails = {
    bankName: "JPMorgan Chase Bank",
    accountNumber: "1234567890123",
    accountName: "Axiomify Financial Ltd",
    cryptoAddress: "TL7yzxcbeu8fqLH2hWNVuD3S5J1YUZUJVW",
    cryptoNetwork: "USDT (TRC-20)",
    whatsappNumber: "+16463510973",
    address: "1900 Connecticut Ave NW, Washington, DC 20009, United States"
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user's last deposit time
      if (updateUserProfile) {
        updateUserProfile({ lastDepositTime: new Date().toISOString() });
      }
      
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
  
  const handleWhatsAppContact = () => {
    const message = `Hi, I'm contacting you regarding my deposit request for ${user?.currencySymbol}${amount}. Reference: ${referenceNumber}`;
    const whatsappUrl = `https://wa.me/${p2pDetails.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit Funds</CardTitle>
        <CardDescription>Choose your preferred deposit method</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bank" className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="bank">
              <CreditCard className="h-4 w-4 mr-2" />
              Bank Transfer
            </TabsTrigger>
            <TabsTrigger value="card">
              <CreditCard className="h-4 w-4 mr-2" />
              Card Payment
            </TabsTrigger>
            <TabsTrigger value="crypto">
              <Bitcoin className="h-4 w-4 mr-2" />
              Cryptocurrency
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
                  <div className="pt-2 border-t">
                    <Label>Bank Address</Label>
                    <p className="text-sm text-muted-foreground">{p2pDetails.address}</p>
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

                  {amount && referenceNumber && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={handleWhatsAppContact}
                    >
                      Contact Support via WhatsApp
                    </Button>
                  )}
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
          
          <TabsContent value="card" className="space-y-4">
            {!isSubmitted ? (
              <>
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Card Name</Label>
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
                  <div className="flex justify-between items-center">
                    <Label>Card Number</Label>
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
                  <div className="pt-2 border-t">
                    <Label>Card Address</Label>
                    <p className="text-sm text-muted-foreground">{p2pDetails.address}</p>
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

                  {amount && referenceNumber && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={handleWhatsAppContact}
                    >
                      Contact Support via WhatsApp
                    </Button>
                  )}
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
            <CryptoOptions />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
