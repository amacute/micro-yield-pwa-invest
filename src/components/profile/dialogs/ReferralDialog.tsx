
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Users } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useInvestment } from '@/contexts/InvestmentContext';

interface ReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReferralDialog({ open, onOpenChange }: ReferralDialogProps) {
  const { user } = useAuth();
  const { getUserReferralLink } = useInvestment();
  
  // Generate a referral link
  const referralLink = user ? getUserReferralLink(user.id) : 'https://axiomify.com/signup';
  
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Refer Friends & Earn</DialogTitle>
          <DialogDescription>
            Invite your friends to join Axiomify and earn a 5% bonus on their investments, plus 5% on recommitments.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted p-4 rounded-md">
            <Label className="text-sm mb-2 block">Your Referral Link</Label>
            <div className="flex items-center gap-2">
              <Input value={referralLink} readOnly className="text-sm" />
              <Button size="sm" variant="outline" onClick={copyReferralLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-md border border-dashed">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <Users className="h-10 w-10 text-axiom-primary mx-auto mb-2" />
                <h3 className="font-medium mb-1">Invite & Earn</h3>
                <p className="text-sm text-muted-foreground mb-2">You'll receive 5% of your friend's first investment</p>
                <div className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 p-2 rounded">
                  Plus 5% bonus on all their recommitments!
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                // This would open an email share dialog in a real application
                toast.success('Email sharing initiated');
              }}
            >
              Share via Email
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                // This would open a social media share dialog in a real application
                toast.success('Social media sharing initiated');
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
