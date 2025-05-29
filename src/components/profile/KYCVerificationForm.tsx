import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Loader2, Upload } from 'lucide-react';
import { submitKYCVerification, KYCVerificationData } from '@/services/kyc';

const formSchema = z.object({
  verificationType: z.enum(['basic', 'advanced']),
  documentType: z.enum(['passport', 'national_id', 'drivers_license']),
  documentNumber: z.string().min(1, 'Document number is required'),
  documentExpiry: z.string().min(1, 'Expiry date is required'),
  documentFront: z.any().refine((file) => file instanceof File, 'Front document image is required'),
  documentBack: z.any().optional(),
  selfie: z.any().refine((file) => file instanceof File, 'Selfie image is required'),
  addressProof: z.any().optional()
});

export function KYCVerificationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentFrontPreview, setDocumentFrontPreview] = useState<string>('');
  const [documentBackPreview, setDocumentBackPreview] = useState<string>('');
  const [selfiePreview, setSelfiePreview] = useState<string>('');
  const [addressProofPreview, setAddressProofPreview] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verificationType: 'basic',
      documentType: 'passport'
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, previewSetter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file);
      previewSetter(url);
      
      // Clean up preview URL when component unmounts
      return () => URL.revokeObjectURL(url);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const verificationData: KYCVerificationData = {
        ...values,
        documentExpiry: new Date(values.documentExpiry)
      };

      const result = await submitKYCVerification(verificationData);

      if (result.error) {
        throw new Error(result.error as string);
      }

      toast.success('KYC verification submitted successfully');
      form.reset();
      // Clear previews
      setDocumentFrontPreview('');
      setDocumentBackPreview('');
      setSelfiePreview('');
      setAddressProofPreview('');
    } catch (error) {
      console.error('Error submitting KYC verification:', error);
      toast.error('Failed to submit KYC verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Verification</CardTitle>
        <CardDescription>
          Complete your identity verification to increase your investment limits and unlock additional features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="verificationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="basic">Basic ($5,000 limit)</SelectItem>
                      <SelectItem value="advanced">Advanced ($50,000 limit)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose your verification level based on your investment needs
                  </FormDescription>
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
                        <SelectValue placeholder="Select document type" />
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
              name="documentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter document number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentExpiry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Expiry Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="documentFront"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Document Front</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onChange(file);
                              handleFileChange(e, setDocumentFrontPreview);
                            }
                          }}
                          {...field}
                        />
                        {documentFrontPreview && (
                          <div className="relative aspect-video w-full">
                            <img
                              src={documentFrontPreview}
                              alt="Document front preview"
                              className="rounded-lg object-cover w-full h-full"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentBack"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Document Back (Optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onChange(file);
                              handleFileChange(e, setDocumentBackPreview);
                            }
                          }}
                          {...field}
                        />
                        {documentBackPreview && (
                          <div className="relative aspect-video w-full">
                            <img
                              src={documentBackPreview}
                              alt="Document back preview"
                              className="rounded-lg object-cover w-full h-full"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="selfie"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Selfie with Document</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                            handleFileChange(e, setSelfiePreview);
                          }
                        }}
                        {...field}
                      />
                      {selfiePreview && (
                        <div className="relative aspect-video w-full">
                          <img
                            src={selfiePreview}
                            alt="Selfie preview"
                            className="rounded-lg object-cover w-full h-full"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Take a clear photo of yourself holding your ID document
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('verificationType') === 'advanced' && (
              <FormField
                control={form.control}
                name="addressProof"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Proof of Address</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onChange(file);
                              handleFileChange(e, setAddressProofPreview);
                            }
                          }}
                          {...field}
                        />
                        {addressProofPreview && (
                          <div className="relative aspect-video w-full">
                            <img
                              src={addressProofPreview}
                              alt="Address proof preview"
                              className="rounded-lg object-cover w-full h-full"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload a recent utility bill or bank statement (not older than 3 months)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Verification
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 