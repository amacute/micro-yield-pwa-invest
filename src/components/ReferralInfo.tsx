import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Share2 } from 'lucide-react';

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalEarnings: number;
  referralCode: string;
}

export function ReferralInfo() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's referral code
      const { data: userData } = await supabase
        .from('users')
        .select('referral_code')
        .eq('user_id', user.id)
        .single();

      // Get referral statistics
      const { data: referrals } = await supabase
        .from('referrals')
        .select('status, bonus_amount')
        .eq('referrer_id', user.id);

      if (referrals && userData) {
        const stats: ReferralStats = {
          totalReferrals: referrals.length,
          pendingReferrals: referrals.filter(r => r.status === 'pending').length,
          completedReferrals: referrals.filter(r => r.status === 'completed').length,
          totalEarnings: referrals
            .filter(r => r.status === 'completed')
            .reduce((sum, r) => sum + (r.bonus_amount || 0), 0),
          referralCode: userData.referral_code
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      toast.error('Failed to load referral information');
    } finally {
      setLoading(false);
    }
  };

  const shareReferralLink = async () => {
    if (!stats?.referralCode) return;
    
    const referralLink = `${window.location.origin}/signup?ref=${stats.referralCode}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join Micro Yield Invest',
          text: 'Join me on Micro Yield Invest and we both get a $10 bonus!',
          url: referralLink
        });
      } else {
        await navigator.clipboard.writeText(referralLink);
        toast.success('Referral link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share referral link');
    }
  };

  if (loading) {
    return <div>Loading referral information...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Referrals</p>
              <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats?.pendingReferrals || 0}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats?.completedReferrals || 0}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">${stats?.totalEarnings || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Share Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-mono break-all">{stats?.referralCode}</p>
          </div>
          <Button
            onClick={shareReferralLink}
            className="w-full"
            variant="default"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Referral Link
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 