
import { Wallet, PieChart, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useAuth } from '@/contexts/AuthContext';
import { useInvestment } from '@/contexts/InvestmentContext';
import { InvestmentCard } from '@/components/investments/InvestmentCard';
import { Link } from 'react-router-dom';
import { MessageBanner } from '@/components/dashboard/MessageBanner';
import { toast } from '@/components/ui/sonner';

export default function Dashboard() {
  const { user } = useAuth();
  const { userInvestments, availableInvestments, getUserReferralLink, getReferralStats } = useInvestment();
  
  // Get featured investments (just showing a few)
  const featuredInvestments = availableInvestments.slice(0, 2);
  
  // Get active user investments
  const activeInvestments = userInvestments.filter(inv => inv.status === 'active');
  
  // Get referral stats
  const referralStats = user ? getReferralStats(user.id) : { totalEarnings: 0, totalReferrals: 0 };
  
  // Mock admin messages that would come from the backend in a real app
  const adminMessages = [
    {
      id: 1,
      title: 'New Investment Opportunity',
      content: 'Don\'t miss our latest high return investment opportunity with 100% returns in 72 hours!',
      type: 'announcement' as const,
      date: '2023-05-23'
    },
    {
      id: 2,
      title: 'Complete Your Verification',
      content: 'Please complete your verification to unlock all platform features and increased investment limits.',
      type: 'important' as const,
      date: '2023-05-22'
    }
  ];
  
  const handleCopyReferralLink = () => {
    if (user) {
      const referralLink = getUserReferralLink(user.id);
      navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    } else {
      toast.error('Please log in to get your referral link');
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Here's an overview of your investments</p>
      </div>
      
      {/* Admin Messages Banner */}
      <MessageBanner messages={adminMessages} />
      
      {/* Hero Image Section */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-48 bg-gradient-to-r from-axiom-primary/20 to-axiom-secondary/20">
            <img 
              src="https://img.freepik.com/free-photo/standard-quality-control-collage-concept_23-2149595831.jpg?uid=R184108826&ga=GA1.1.1999243242.1748064813&semt=ais_hybrid&w=740"
              alt="Investment Dashboard"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
              <div className="p-6 text-white">
                <h2 className="text-3xl font-bold mb-2">Smart Investment Platform</h2>
                <p className="text-lg opacity-90">Grow your wealth with secure P2P investments</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard 
          title="Wallet Balance" 
          value={`${user?.currencySymbol || '$'}${user?.walletBalance.toFixed(2) || '0.00'}`}
          icon={<Wallet className="h-4 w-4 text-axiom-primary" />}
        />
        <StatsCard 
          title="Active Investments" 
          value={activeInvestments.length}
          icon={<PieChart className="h-4 w-4 text-axiom-primary" />}
        />
        <StatsCard 
          title="Total Returns" 
          value={`${user?.currencySymbol || '$'}350.75`}
          change={{ value: "15%", positive: true }}
          icon={<TrendingUp className="h-4 w-4 text-axiom-primary" />}
        />
        <StatsCard 
          title="Referral Earnings" 
          value={`${user?.currencySymbol || '$'}${referralStats.totalEarnings.toFixed(2)}`}
          icon={<Users className="h-4 w-4 text-axiom-primary" />}
        />
      </div>
      
      {activeInvestments.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Active Investments</h2>
            <Link to="/investments/my">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeInvestments.slice(0, 2).map(investment => (
              <Card key={investment.id}>
                <CardContent className="p-6">
                  <div className="mb-3">
                    <h3 className="font-medium">{investment.investmentTitle}</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Investment Amount</span>
                      <span className="font-medium">{user?.currencySymbol || '$'}{investment.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-md grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Expected Return</p>
                        <p className="font-medium text-green-600">{user?.currencySymbol || '$'}{investment.expectedReturn.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Payout Date</p>
                        <p className="font-medium">{investment.endDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {/* Recommit replaced with Deposit button */}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = '/wallet#deposit'}
                    >
                      Deposit More Funds
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Featured Opportunities</h2>
          <Link to="/investments">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredInvestments.map(investment => (
            <InvestmentCard key={investment.id} investment={investment} />
          ))}
        </div>
      </div>
      
      <Card className="border-dashed border-2 bg-muted/30">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="p-3 bg-axiom-primary/10 rounded-full mb-4">
            <Users className="h-6 w-6 text-axiom-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">Refer a Friend & Earn 5%</h3>
          <p className="text-muted-foreground mb-4">
            Earn 5% for each friend who signs up and makes their first investment, plus 5% on all their future investments
          </p>
          <div className="flex flex-col gap-2 w-full max-w-md">
            <div className="text-sm text-muted-foreground">
              Your Referrals: {referralStats.totalReferrals} | Total Earnings: {user?.currencySymbol || '$'}{referralStats.totalEarnings.toFixed(2)}
            </div>
            <Button onClick={handleCopyReferralLink}>
              Copy Referral Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
