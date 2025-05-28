import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Loader2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface KYCVerification {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  verification_type: 'basic' | 'advanced';
  document_type: string;
  document_number: string;
  document_expiry: string;
  document_front_url: string;
  document_back_url: string | null;
  selfie_url: string;
  address_proof_url: string | null;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
}

export function KYCVerificationManagement() {
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<KYCVerification | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select(`
          *,
          user:users(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerifications(data as KYCVerification[]);
    } catch (error) {
      console.error('Error loading verifications:', error);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (verificationId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingAction(true);

      const verification = verifications.find(v => v.id === verificationId);
      if (!verification) throw new Error('Verification not found');

      // Update verification status
      const { error: updateError } = await supabase
        .from('kyc_verifications')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          verified_at: action === 'approve' ? new Date().toISOString() : null,
          verified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', verificationId);

      if (updateError) throw updateError;

      // Update user's KYC status
      if (action === 'approve') {
        const { error: userError } = await supabase.rpc('update_user_kyc_status', {
          p_user_id: verification.user_id,
          p_status: 'approved',
          p_verification_type: verification.verification_type
        });

        if (userError) throw userError;
      }

      toast.success(`Verification ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowDialog(false);
      loadVerifications();
    } catch (error) {
      console.error('Error processing verification:', error);
      toast.error('Failed to process verification');
    } finally {
      setProcessingAction(false);
    }
  };

  const getDocumentUrl = async (path: string) => {
    try {
      const { data } = await supabase.storage
        .from('kyc-documents')
        .createSignedUrl(path, 300); // URL valid for 5 minutes

      return data?.signedUrl;
    } catch (error) {
      console.error('Error getting document URL:', error);
      return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Verifications</CardTitle>
        <CardDescription>Manage user identity verifications</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verifications.map((verification) => (
                <TableRow key={verification.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{verification.user.name}</div>
                      <div className="text-sm text-muted-foreground">{verification.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={verification.verification_type === 'advanced' ? 'default' : 'secondary'}>
                      {verification.verification_type.charAt(0).toUpperCase() + verification.verification_type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {verification.document_type.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      verification.status === 'approved' ? 'success' :
                      verification.status === 'rejected' ? 'destructive' :
                      'warning'
                    }>
                      {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(verification.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedVerification(verification);
                          setShowDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {verification.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleVerificationAction(verification.id, 'approve')}
                            disabled={processingAction}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleVerificationAction(verification.id, 'reject')}
                            disabled={processingAction}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {verifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No verifications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
            <DialogDescription>
              Review user submitted verification documents
            </DialogDescription>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">User Information</h4>
                  <div className="space-y-1">
                    <p><span className="text-muted-foreground">Name:</span> {selectedVerification.user.name}</p>
                    <p><span className="text-muted-foreground">Email:</span> {selectedVerification.user.email}</p>
                    <p><span className="text-muted-foreground">Document Type:</span> {
                      selectedVerification.document_type.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')
                    }</p>
                    <p><span className="text-muted-foreground">Document Number:</span> {selectedVerification.document_number}</p>
                    <p><span className="text-muted-foreground">Expiry Date:</span> {
                      format(new Date(selectedVerification.document_expiry), 'MMM d, yyyy')
                    }</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Verification Status</h4>
                  <div className="space-y-1">
                    <p>
                      <span className="text-muted-foreground">Status:</span>{' '}
                      <Badge variant={
                        selectedVerification.status === 'approved' ? 'success' :
                        selectedVerification.status === 'rejected' ? 'destructive' :
                        'warning'
                      }>
                        {selectedVerification.status.charAt(0).toUpperCase() + selectedVerification.status.slice(1)}
                      </Badge>
                    </p>
                    <p><span className="text-muted-foreground">Submitted:</span> {
                      format(new Date(selectedVerification.created_at), 'MMM d, yyyy HH:mm')
                    }</p>
                    <p><span className="text-muted-foreground">Verification Type:</span> {
                      selectedVerification.verification_type.charAt(0).toUpperCase() + 
                      selectedVerification.verification_type.slice(1)
                    }</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Documents</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Document Front</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img
                        src={getDocumentUrl(selectedVerification.document_front_url)}
                        alt="Document front"
                        className="rounded-lg"
                      />
                    </CardContent>
                  </Card>

                  {selectedVerification.document_back_url && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Document Back</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <img
                          src={getDocumentUrl(selectedVerification.document_back_url)}
                          alt="Document back"
                          className="rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Selfie with Document</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img
                        src={getDocumentUrl(selectedVerification.selfie_url)}
                        alt="Selfie"
                        className="rounded-lg"
                      />
                    </CardContent>
                  </Card>

                  {selectedVerification.address_proof_url && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Proof of Address</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <img
                          src={getDocumentUrl(selectedVerification.address_proof_url)}
                          alt="Address proof"
                          className="rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {selectedVerification.status === 'pending' && (
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleVerificationAction(selectedVerification.id, 'reject')}
                    disabled={processingAction}
                  >
                    {processingAction ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleVerificationAction(selectedVerification.id, 'approve')}
                    disabled={processingAction}
                  >
                    {processingAction ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
} 