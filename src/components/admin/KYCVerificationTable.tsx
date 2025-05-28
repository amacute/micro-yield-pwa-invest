import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { getKYCDocuments, getDocumentPreviewUrl, KYCDocument } from '@/services/kyc';

interface KYCVerificationTableProps {
  onUpdateStatus: (documentId: string, status: 'approved' | 'rejected', reason?: string) => Promise<void>;
}

export function KYCVerificationTable({ onUpdateStatus }: KYCVerificationTableProps) {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await getKYCDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (document: KYCDocument) => {
    try {
      const url = await getDocumentPreviewUrl(document.id);
      setPreviewUrl(url);
      setSelectedDocument(document);
    } catch (error) {
      console.error('Error getting preview URL:', error);
      toast.error('Failed to load document preview');
    }
  };

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!selectedDocument) return;

    try {
      setIsUpdating(true);
      await onUpdateStatus(
        selectedDocument.id,
        status,
        status === 'rejected' ? rejectionReason : undefined
      );
      toast.success(`Document ${status} successfully`);
      setSelectedDocument(null);
      setPreviewUrl(null);
      setRejectionReason('');
      await loadDocuments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: KYCDocument['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>KYC Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.id}</TableCell>
                    <TableCell className="capitalize">
                      {doc.type.replace('_', ' ')}
                    </TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell>
                      {format(new Date(doc.uploadedAt), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(doc)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {documents.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No verifications to review
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedDocument}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDocument(null);
            setPreviewUrl(null);
            setRejectionReason('');
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review Verification</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6">
            {previewUrl && (
              <div className="aspect-video relative rounded-lg overflow-hidden border">
                {previewUrl.endsWith('.pdf') ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full"
                    title="Document preview"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Document preview"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            )}

            <div className="grid gap-4">
              {selectedDocument?.status === 'pending' && (
                <>
                  <Textarea
                    placeholder="Enter rejection reason (required for rejecting)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />

                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleStatusUpdate('approved')}
                      disabled={isUpdating}
                      className="flex-1"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={isUpdating || !rejectionReason}
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </>
              )}

              {selectedDocument?.status === 'rejected' && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  <p className="font-medium">Rejection Reason:</p>
                  <p>{selectedDocument.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 