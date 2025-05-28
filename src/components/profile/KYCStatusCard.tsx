import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getKYCStatus, KYCStatus } from '@/services/kyc';
import { format } from 'date-fns';

export function KYCStatusCard() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<KYCStatus>({
    verified: false,
    level: 'none',
    verifiedAt: null,
    investmentLimit: 1000,
    pendingVerification: false
  });
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

  const getProgressValue = () => {
    if (status.verified) return 100;
    if (status.pendingVerification) return 66;
    return status.level === 'none' ? 0 : 33;
  };

  const getStatusColor = () => {
    if (status.verified) return 'text-green-500';
    if (status.pendingVerification) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = () => {
    if (status.verified) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status.pendingVerification) return <Clock className="h-5 w-5 text-yellow-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>KYC Verification Status</CardTitle>
            <CardDescription>
              Verify your identity to increase investment limits
            </CardDescription>
          </div>
          {getStatusIcon()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Verification Progress</span>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {status.verified ? 'Verified' : 
               status.pendingVerification ? 'Under Review' : 
               'Not Verified'}
            </span>
          </div>
          <Progress value={getProgressValue()} className="h-2" />
        </div>

        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Verification Level</span>
            </div>
            <Badge variant={status.level === 'advanced' ? 'default' : 'secondary'}>
              {status.level.charAt(0).toUpperCase() + status.level.slice(1)}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Investment Limit</span>
            <span className="font-medium">${status.investmentLimit.toLocaleString()}</span>
          </div>

          {status.verifiedAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Verified On</span>
              <span className="text-sm">{format(new Date(status.verifiedAt), 'MMM d, yyyy')}</span>
            </div>
          )}

          {!status.verified && !status.pendingVerification && (
            <Button 
              className="w-full"
              onClick={() => navigate('/profile/kyc')}
            >
              Complete Verification
            </Button>
          )}

          {status.pendingVerification && (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Your verification is under review. This usually takes 24-48 hours.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 