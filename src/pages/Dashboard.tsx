
import { Wallet, PieChart, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useAuth } from '@/contexts/AuthContext';
import { useInvestment } from '@/contexts/InvestmentContext';
import { InvestmentCard } from '@/components/investments/InvestmentCard';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { userInvestments, availableInvestments } = useInvestment();
  
  // Get featured investments (just showing a few)
  const featuredInvestments = availableInvestments.slice(0, 2);
  
  // Get active user investments
  const activeInvestments = userInvestments.filter(inv => inv.status === 'active');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Here's an overview of your investments</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard 
          title="Wallet Balance" 
          value={`$${user?.walletBalance.toFixed(2) || '0.00'}`}
          icon={<Wallet className="h-4 w-4 text-axiom-primary" />}
        />
        <StatsCard 
          title="Active Investments" 
          value={activeInvestments.length}
          icon={<PieChart className="h-4 w-4 text-axiom-primary" />}
        />
        <StatsCard 
          title="Total Returns" 
          value="$350.75"
          change={{ value: "15%", positive: true }}
          icon={<TrendingUp className="h-4 w-4 text-axiom-primary" />}
        />
        <StatsCard 
          title="Referrals" 
          value="3"
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
                      <span className="font-medium">${investment.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-md grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Expected Return</p>
                        <p className="font-medium text-green-600">${investment.expectedReturn.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Payout Date</p>
                        <p className="font-medium">{investment.endDate.toLocaleDateString()}</p>
                      </div>
                    </div>
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
          <h3 className="text-xl font-medium mb-2">Refer a Friend</h3>
          <p className="text-muted-foreground mb-4">
            Earn $25 for each friend who signs up and makes their first investment
          </p>
          <Button>Invite Friends</Button>
        </CardContent>
      </Card>
    </div>
  );
}
