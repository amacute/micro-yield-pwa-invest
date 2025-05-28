import { useState } from 'react';
import { KYCVerificationTable } from '@/components/admin/KYCVerificationTable';
import { toast } from '@/components/ui/sonner';

export default function AdminKYCPage() {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async (
    documentId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/kyc/update-status?id=${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status.toUpperCase(),
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`Document ${status} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <KYCVerificationTable onUpdateStatus={handleUpdateStatus} />
    </div>
  );
} 