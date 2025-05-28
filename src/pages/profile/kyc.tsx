import { useEffect, useState } from 'react';
import { KYCStatusCard } from '@/components/profile/KYCStatusCard';
import { KYCVerificationForm } from '@/components/profile/KYCVerificationForm';
import { getKYCStatus, KYCStatus } from '@/services/kyc';
import { Loader2 } from 'lucide-react';

export default function KYCVerificationPage() {
  const [status, setStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    try {
      const kycStatus = await getKYCStatus();
      setStatus(kycStatus);
    } catch (error) {
      console.error('Error loading KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-8">
      <KYCStatusCard />
      
      {(!status?.verified && !status?.pendingVerification) && (
        <KYCVerificationForm />
      )}
    </div>
  );
} 