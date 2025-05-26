
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Users, DollarSign, TrendingUp, Share2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface ReferralData {
  referredUserId: string;
  referredUserName: string;
  joinDate: Date;
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
  
  // Generate a unique referral code based on user ID
  const referralCode = user ? `REF${user.id.slice(-6).toUpperCase()}` : 'REF000000';
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  useEffect(() => {
    if (user) {
      loadReferralData();
    }
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;

    try {
      // Get users who were referred by this user
      const { data: referredUsers, error } = await supabase
        .from('users')
        .select('id, name, email, created_at')
        .eq('referral_code', referralCode);

      if (error) {
        console.error('Error loading referral data:', error);
        return;
      }

      const referrals = referredUsers || [];
      
      // Calculate stats
      const totalReferrals = referrals.length;
      const totalEarnings = totalReferrals * 5; // $5 per referral as example
      const currentMonth = new Date().getMonth();
      const monthlyReferrals = referrals.filter(ref => 
        new Date(ref.created_at).getMonth() === currentMonth
      ).length;
      const monthlyEarnings = monthlyReferrals * 5;

      setReferralStats({
        totalReferrals,
        totalEarnings,
        monthlyEarnings,
        pendingCommissions: 0
      });

      // Set recent referrals
      const recentReferralData: ReferralData[] = referrals.map(ref => ({
        referredUserId: ref.id,
        referredUserName: ref.name || ref.email,
        joinDate: new Date(ref.created_at),
        commission: 5,
        status: 'active'
      }));

      setRecentReferrals(recentReferralData.slice(0, 5));
    } catch (error) {
      console.error('Error loading referral data:', error);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard');
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied to clipboard');
  };

  const shareReferral = () => {
    const text = `Join me on Axiomify for secure P2P lending! Use my referral code: ${referralCode} or click: ${referralLink}`;
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
              <Input value={referralCode} readOnly className="text-lg font-mono" />
              <Button size="sm" variant="outline" onClick={copyReferralCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="text-sm mb-2 block">Personal Referral Link</Label>
            <div className="flex items-center gap-2">
              <Input value={referralLink} readOnly className="text-sm" />
              <Button size="sm" variant="outline" onClick={copyReferralLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={shareReferral} className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share Referral
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                const subject = 'Join Axiomify P2P Lending Platform!';
                const body = `Hi! I've been using Axiomify for P2P lending and thought you might be interested. Use my personal referral code: ${referralCode} or click: ${referralLink}`;
                window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
              }}
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
              <span>Earn 2% commission on their loan transactions</span>
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
              recentReferrals.map((referral, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{referral.referredUserName}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {referral.joinDate.toLocaleDateString()}
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
