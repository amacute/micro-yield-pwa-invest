import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Loader2, Upload } from 'lucide-react';
import { submitKYCVerification, getVerificationAttempts, KYCSubmission } from '@/services/kyc';

const formSchema = z.object({
  verificationLevel: z.enum(['basic', 'advanced']),
  documentType: z.enum(['passport', 'national_id', 'drivers_license']),
  fullName: z.string().min(2, 'Full name is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().min(2, 'Postal code is required'),
});

export function KYCVerificationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verificationLevel: 'basic',
      documentType: 'passport',
      fullName: '',
      dateOfBirth: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
    },
  });

  const loadAttempts = async () => {
    try {
      const { remainingAttempts } = await getVerificationAttempts();
      setRemainingAttempts(remainingAttempts);
    } catch (error) {
      console.error('Error loading attempts:', error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!documentFile) {
      toast.error('Please upload a document');
      return;
    }

    try {
      setIsSubmitting(true);

      const submission: KYCSubmission = {
        documentType: values.documentType,
        documentFile,
        verificationLevel: values.verificationLevel,
        personalInfo: {
          fullName: values.fullName,
          dateOfBirth: values.dateOfBirth,
          address: values.address,
          city: values.city,
          country: values.country,
          postalCode: values.postalCode,
        },
      };

      await submitKYCVerification(submission);
      toast.success('KYC verification submitted successfully');
      await loadAttempts();
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('Failed to submit verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setDocumentFile(file);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>KYC Verification</CardTitle>
        <CardDescription>
          Complete your identity verification to increase your investment limits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="verificationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Level</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="basic" id="basic" />
                          <Label htmlFor="basic">
                            Basic ($5,000 limit)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="advanced" id="advanced" />
                          <Label htmlFor="advanced">
                            Advanced ($50,000 limit)
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="national_id">National ID</SelectItem>
                        <SelectItem value="drivers_license">Driver's License</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Document Upload</FormLabel>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="document-upload"
                  />
                  <Label
                    htmlFor="document-upload"
                    className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Label>
                  {documentFile && (
                    <span className="text-sm text-muted-foreground">
                      {documentFile.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {remainingAttempts !== null && remainingAttempts === 0 ? (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                You have no remaining verification attempts. Please try again in 24 hours.
              </div>
            ) : (
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Verification'
                )}
              </Button>
            )}

            {remainingAttempts !== null && remainingAttempts > 0 && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                You have {remainingAttempts} verification attempt{remainingAttempts !== 1 ? 's' : ''} remaining
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 