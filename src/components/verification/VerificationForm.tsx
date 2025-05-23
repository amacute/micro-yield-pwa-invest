
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/common/Loader';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

export function VerificationForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [govId, setGovId] = useState<File | null>(null);
  const [bvnNumber, setBvnNumber] = useState('');
  const [idPreview, setIdPreview] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Mock database of already used verification IDs/BVNs
  const mockUsedVerifications = {
    bvn: ['12345678901', '98765432109'],
    govId: ['ID12345', 'ID54321']
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setVerificationError('');
    if (file) {
      setGovId(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mock function to check if ID is already used
  const isIdAlreadyUsed = (idNumber: string): boolean => {
    // In real app, this would be an API call to check the database
    return mockUsedVerifications.govId.includes(idNumber);
  };

  // Mock function to check if BVN is already used
  const isBvnAlreadyUsed = (bvn: string): boolean => {
    // In real app, this would be an API call to check the database
    return mockUsedVerifications.bvn.includes(bvn);
  };

  // Mock function to extract ID number from image
  const extractIdNumber = (file: File): Promise<string> => {
    // In real app, this would use OCR or similar technology
    return new Promise(resolve => {
      setTimeout(() => {
        // For demo purposes, just return a random ID
        const mockIdNumber = 'ID' + Math.floor(Math.random() * 100000);
        resolve(mockIdNumber);
      }, 1000);
    });
  };

  const handleIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');
    
    if (!govId) {
      toast.error('Please upload a government issued ID');
      return;
    }
    
    setIsLoading(true);
    try {
      // In a real app, we would extract the ID number using OCR
      const extractedIdNumber = await extractIdNumber(govId);
      
      // Check if the ID is already used
      if (isIdAlreadyUsed(extractedIdNumber)) {
        setVerificationError('This ID is already registered with another account. Each ID can only be used once.');
        toast.error('Verification failed: ID already in use');
        setIsLoading(false);
        return;
      }
      
      // For this demo, we'll just simulate a successful upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would add the ID to the database
      // mockUsedVerifications.govId.push(extractedIdNumber);
      
      toast.success('ID verification submitted successfully. Your account will be verified within 24 hours.');
    } catch (error) {
      toast.error('Failed to submit verification');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBvnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');
    
    if (!bvnNumber || bvnNumber.length !== 11) {
      toast.error('Please enter a valid 11-digit BVN number');
      return;
    }
    
    setIsLoading(true);
    try {
      // Check if BVN is already used
      if (isBvnAlreadyUsed(bvnNumber)) {
        setVerificationError('This BVN is already registered with another account. Each BVN can only be used once.');
        toast.error('Verification failed: BVN already in use');
        setIsLoading(false);
        return;
      }
      
      // In a real app, we would verify the BVN with a banking API
      // For this demo, we'll just simulate a successful verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would add the BVN to the database
      // mockUsedVerifications.bvn.push(bvnNumber);
      
      toast.success('BVN verification submitted successfully. Your account will be verified within 24 hours.');
    } catch (error) {
      toast.error('Failed to verify BVN');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Your Identity</CardTitle>
        <CardDescription>
          Complete your verification to unlock full platform features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="id" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="id">Government ID</TabsTrigger>
            <TabsTrigger value="bvn">BVN Number</TabsTrigger>
          </TabsList>
          
          {verificationError && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="text-sm text-destructive">{verificationError}</div>
            </div>
          )}
          
          <TabsContent value="id">
            <form onSubmit={handleIdSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id-upload">Upload Government ID</Label>
                <div className="grid gap-2">
                  <Input
                    id="id-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: JPG, PNG, PDF. Maximum size: 5MB
                  </p>
                  <p className="text-xs text-amber-500">
                    Important: Each ID can only be used to verify one account.
                  </p>
                </div>
              </div>

              {idPreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="border rounded-md overflow-hidden">
                    <img 
                      src={idPreview} 
                      alt="ID Preview" 
                      className="max-w-full h-auto max-h-60 object-contain mx-auto"
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading || !govId} 
                className="w-full"
              >
                {isLoading ? <Loader size="small" color="text-white" /> : 'Submit for Verification'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="bvn">
            <form onSubmit={handleBvnSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bvn-number">BVN Number</Label>
                <Input
                  id="bvn-number"
                  placeholder="Enter your 11-digit BVN number"
                  value={bvnNumber}
                  onChange={(e) => {
                    setBvnNumber(e.target.value.replace(/\D/g, '').slice(0, 11));
                    setVerificationError('');
                  }}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Your Bank Verification Number (BVN) is a unique identifier linked to all your bank accounts
                </p>
                <p className="text-xs text-amber-500">
                  Important: Each BVN can only be used to verify one account.
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || bvnNumber.length !== 11} 
                className="w-full"
              >
                {isLoading ? <Loader size="small" color="text-white" /> : 'Verify BVN'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center text-center border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Verification typically takes 24 hours to complete. You'll receive an email once verified.
        </p>
      </CardFooter>
    </Card>
  );
}
