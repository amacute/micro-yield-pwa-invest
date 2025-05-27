import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Copy, Share2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface Referral {
  id: string;
  referee: {
    name: string;
    email: string;
  };
  status: string;
  bonus_amount: number;
  created_at: string;
}

export const ReferralInfo: React.FC = () => {
  const [referralCode, setReferralCode] = useState<string>('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalBonus, setTotalBonus] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReferralInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Get user's referral code
          const { data: userData } = await supabase
            .from('users')
            .select('referral_code')
            .eq('user_id', user.id)
            .single();

          if (userData) {
            setReferralCode(userData.referral_code);
          }

          // Get user's referrals
          const { data: referralsData } = await supabase
            .from('referrals')
            .select(`
              id,
              referee:users!referrals_referee_id_fkey(
                name,
                email
              ),
              status,
              bonus_amount,
              created_at
            `)
            .eq('referrer_id', user.id)
            .order('created_at', { ascending: false });

          if (referralsData) {
            setReferrals(referralsData);
            setTotalBonus(
              referralsData
                .filter(ref => ref.status === 'completed')
                .reduce((sum, ref) => sum + ref.bonus_amount, 0)
            );
          }
        }
      } catch (error) {
        console.error('Error loading referral info:', error);
        toast.error('Failed to load referral information');
      } finally {
        setLoading(false);
      }
    };

    loadReferralInfo();
  }, []);

  const copyReferralLink = async () => {
    const referralLink = `${window.location.origin}/auth/signup?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy referral link');
    }
  };

  const shareReferralLink = async () => {
    const referralLink = `${window.location.origin}/auth/signup?ref=${referralCode}`;
    const shareData = {
      title: 'Join me on MicroYield',
      text: 'Sign up using my referral link and get started with P2P lending!',
      url: referralLink
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await copyReferralLink();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Referrals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg">
              <h3 className="font-medium mb-2">Your Referral Code</h3>
              <div className="flex gap-2">
                <Input
                  value={referralCode}
                  readOnly
                  className="font-mono uppercase"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyReferralLink}
                  title="Copy referral link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={shareReferralLink}
                  title="Share referral link"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-primary/5 rounded-lg">
                <h4 className="text-sm font-medium mb-1">Total Referrals</h4>
                <p className="text-2xl font-bold">{referrals.length}</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg">
                <h4 className="text-sm font-medium mb-1">Total Bonus Earned</h4>
                <p className="text-2xl font-bold">${totalBonus.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Recent Referrals</h3>
              {referrals.length > 0 ? (
                <div className="space-y-2">
                  {referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{referral.referee.name || referral.referee.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                          {referral.status === 'completed' ? 'Verified' : 'Pending'}
                        </Badge>
                        {referral.status === 'completed' && (
                          <span className="text-sm font-medium text-green-600">
                            +${referral.bonus_amount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No referrals yet. Share your referral code to start earning bonuses!
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 