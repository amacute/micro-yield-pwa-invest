
import { useAuth } from '@/contexts/AuthContext';
import { useInvestment } from '@/contexts/InvestmentContext';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Users, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface ReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReferralDialog({ open, onOpenChange }: ReferralDialogProps) {
  const { user } = useAuth();
  const { getUserReferralLink, getReferralStats, getUserReferrals } = useInvestment();
  
  // Generate a referral link
  const referralLink = user ? getUserReferralLink(user.id) : 'https://axiomify.com/signup';
  const referralStats = user ? getReferralStats(user.id) : { totalEarnings: 0, totalReferrals: 0 };
  const userReferrals = user ? getUserReferrals(user.id) : [];
  
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Refer Friends & Earn 5%</DialogTitle>
          <DialogDescription>
            Invite your friends to join Axiomify and earn a 5% commission on their investments, plus 5% on all their future investments.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Referral Stats */}
          <div className="grid grid-cols-3 gap-4">
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
                <p className="text-2xl font-bold">5%</p>
                <p className="text-sm text-muted-foreground">Commission Rate</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Referral Link */}
          <div className="bg-muted p-4 rounded-md">
            <Label className="text-sm mb-2 block">Your Referral Link</Label>
            <div className="flex items-center gap-2">
              <Input value={referralLink} readOnly className="text-sm" />
              <Button size="sm" variant="outline" onClick={copyReferralLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* How it Works */}
          <div className="bg-muted/50 p-4 rounded-md border border-dashed">
            <h3 className="font-medium mb-3">How Referral Commissions Work</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-axiom-primary rounded-full"></div>
                <span>Earn 5% commission on your friend's first investment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-axiom-primary rounded-full"></div>
                <span>Earn 5% commission on all their future investments and reinvestments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-axiom-primary rounded-full"></div>
                <span>Commissions are automatically added to your account</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-axiom-primary rounded-full"></div>
                <span>No limit on the number of referrals you can make</span>
              </div>
            </div>
          </div>
          
          {/* Recent Referrals */}
          {userReferrals.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Recent Referral Activity</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {userReferrals.slice(0, 5).map(referral => (
                  <div key={referral.id} className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <div>
                      <p className="text-sm font-medium">
                        {referral.type === 'first_investment' ? 'First Investment' : 'Recommitment'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {referral.date.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        +{user?.currencySymbol || '$'}{referral.commissionAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {referral.commissionRate * 100}% of {user?.currencySymbol || '$'}{referral.investmentAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                const subject = 'Join Axiomify and Start Investing!';
                const body = `Hi! I've been using Axiomify for P2P investments and thought you might be interested. Use my referral link to get started: ${referralLink}`;
                window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
              }}
            >
              Share via Email
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                const text = `Join me on Axiomify for secure P2P investments! ${referralLink}`;
                if (navigator.share) {
                  navigator.share({ title: 'Join Axiomify', text, url: referralLink });
                } else {
                  navigator.clipboard.writeText(text);
                  toast.success('Message copied to clipboard');
                }
              }}
            >
              Share via Social
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
