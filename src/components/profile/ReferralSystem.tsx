
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Users, DollarSign, TrendingUp, Share2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface ReferralData {
  id: string;
  referee_name: string;
  joinDate: string;
  commission: number;
  status: string;
}

export function ReferralSystem() {
  const { user } = useAuth();
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    pendingCommissions: 0
  });
  const [recentReferrals, setRecentReferrals] = useState<ReferralData[]>([]);
  
  // Generate a simple referral code based on user ID
  const userReferralCode = user ? `REF${user.id.slice(-8).toUpperCase()}` : '';
  const referralLink = userReferralCode ? `${window.location.origin}/signup?ref=${userReferralCode}` : '';

  useEffect(() => {
    // For now, we'll use mock data since the referral system tables don't exist yet
    setReferralStats({
      totalReferrals: 0,
      totalEarnings: 0,
      monthlyEarnings: 0,
      pendingCommissions: 0
    });
    setRecentReferrals([]);
  }, [user]);

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard');
    } else {
      toast.error('Referral link not available');
    }
  };

  const copyReferralCode = () => {
    if (userReferralCode) {
      navigator.clipboard.writeText(userReferralCode);
      toast.success('Referral code copied to clipboard');
    } else {
      toast.error('Referral code not available');
    }
  };

  const shareReferral = () => {
    const text = `Join me on Axiomify for secure P2P lending! Use my referral code: ${userReferralCode} or click: ${referralLink}`;
    if (navigator.share) {
      navigator.share({ 
        title: 'Join Axiomify P2P Lending', 
        text, 
        url: referralLink 
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Referral message copied to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-axiom-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
            <p className="text-sm text-muted-foreground">Total Referrals</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{user?.currencySymbol || '$'}{referralStats.totalEarnings.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total Earnings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{user?.currencySymbol || '$'}{referralStats.monthlyEarnings.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">This Month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{user?.currencySymbol || '$'}{referralStats.pendingCommissions.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Links */}
      <Card>
        <CardHeader>
          <CardTitle>Your Unique Referral Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block">Personal Referral Code</Label>
            <div className="flex items-center gap-2">
              <Input value={userReferralCode} readOnly className="text-lg font-mono" />
              <Button size="sm" variant="outline" onClick={copyReferralCode} disabled={!userReferralCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="text-sm mb-2 block">Personal Referral Link</Label>
            <div className="flex items-center gap-2">
              <Input value={referralLink} readOnly className="text-sm" />
              <Button size="sm" variant="outline" onClick={copyReferralLink} disabled={!referralLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={shareReferral} className="flex-1" disabled={!userReferralCode}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Referral
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                const subject = 'Join Axiomify P2P Lending Platform!';
                const body = `Hi! I've been using Axiomify for P2P lending and thought you might be interested. Use my personal referral code: ${userReferralCode} or click: ${referralLink}`;
                window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
              }}
              disabled={!userReferralCode}
            >
              Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Referral Commissions Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-axiom-primary rounded-full"></div>
              <span>Earn $5 commission when someone joins using your referral code</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-axiom-primary rounded-full"></div>
              <span>Earn 2% commission on their lending transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-axiom-primary rounded-full"></div>
              <span>Commissions are automatically added to your wallet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-axiom-primary rounded-full"></div>
              <span>No limit on the number of referrals you can make</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referral Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReferrals.length > 0 ? (
              recentReferrals.map((referral) => (
                <div key={referral.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{referral.referee_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {referral.joinDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      +{user?.currencySymbol || '$'}{referral.commission.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {referral.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No referrals yet. Share your link to get started!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
