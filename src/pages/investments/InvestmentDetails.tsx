
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/common/CountdownTimer';
import { ROICalculator } from '@/components/common/ROICalculator';
import { useInvestment } from '@/contexts/InvestmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Users, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Loader } from '@/components/common/Loader';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function InvestmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { availableInvestments, invest } = useInvestment();
  const { user } = useAuth();
  
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [isInvesting, setIsInvesting] = useState(false);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  
  // Find the investment based on the ID from the URL
  const investment = availableInvestments.find((inv) => inv.id === id);
  
  if (!investment) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">Investment opportunity not found</p>
        <Button onClick={() => navigate('/investments')} variant="outline">
          Back to Investments
        </Button>
      </div>
    );
  }
  
  const progressPercentage = Math.min(
    Math.round((investment.raised / investment.goal) * 100),
    100
  );
  
  const handleInvest = async () => {
    if (!investmentAmount || investmentAmount < investment.minInvestment) {
      toast.error(`Minimum investment is $${investment.minInvestment}`);
      return;
    }
    
    if (investmentAmount > investment.maxInvestment) {
      toast.error(`Maximum investment is $${investment.maxInvestment}`);
      return;
    }
    
    if (!user) {
      toast.error('Please login to invest');
      navigate('/login');
      return;
    }
    
    if (investmentAmount > user.walletBalance) {
      setShowDepositDialog(true);
      return;
    }
    
    setIsInvesting(true);
    try {
      await invest(investment.id, investmentAmount);
      toast.success('Investment successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to process investment');
    } finally {
      setIsInvesting(false);
    }
  };
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'High':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };
  
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{investment.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getRiskColor(investment.risk)}>{investment.risk} Risk</Badge>
            <Badge variant="outline">{investment.category}</Badge>
          </div>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <p className="mb-6">{investment.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-axiom-primary/10 rounded-full">
                <TrendingUp className="h-4 w-4 text-axiom-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Return Rate</p>
                <p className="font-medium">{investment.returnRate}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-axiom-primary/10 rounded-full">
                <Clock className="h-4 w-4 text-axiom-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{investment.duration} hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-axiom-primary/10 rounded-full">
                <Users className="h-4 w-4 text-axiom-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Investors</p>
                <p className="font-medium">{investment.investors}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Funding Progress</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Raised: ${investment.raised}</span>
              <span>Goal: ${investment.goal}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6 p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Time Remaining</p>
              <CountdownTimer endTime={investment.endTime} />
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Investment Range</p>
              <p className="font-medium">${investment.minInvestment} - ${investment.maxInvestment}</p>
            </div>
          </div>
          
          {investment.risk === 'High' && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">High Risk Investment</p>
                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                  This investment carries a higher level of risk. Only invest what you can afford to lose.
                </p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ROICalculator 
              minInvestment={investment.minInvestment}
              maxInvestment={investment.maxInvestment}
              returnRate={investment.returnRate}
              onChange={setInvestmentAmount}
            />
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Investment Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Investment Amount</span>
                    <span className="font-medium">${investmentAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Return Rate</span>
                    <span className="font-medium">{investment.returnRate}%</span>
                  </div>
                  
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{investment.duration} hours</span>
                  </div>
                  
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Expected Return</span>
                    <span className="font-medium text-green-600">${(investmentAmount + (investmentAmount * (investment.returnRate / 100))).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <span className="font-medium">Profit</span>
                    <span className="font-medium text-green-600">${(investmentAmount * (investment.returnRate / 100)).toFixed(2)}</span>
                  </div>
                  
                  <Button 
                    className="w-full btn-gradient mt-4"
                    onClick={handleInvest}
                    disabled={
                      investmentAmount < investment.minInvestment || 
                      investmentAmount > investment.maxInvestment ||
                      isInvesting
                    }
                  >
                    {isInvesting ? <Loader size="small" color="text-white" /> : 'Invest Now'}
                  </Button>
                  
                  {user && user.walletBalance < investment.minInvestment && (
                    <p className="text-center text-sm text-red-500 mt-2">
                      Insufficient funds in your wallet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Insufficient Funds Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insufficient Funds</DialogTitle>
            <DialogDescription>
              You don't have enough funds in your wallet to make this investment.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3 mt-4">
            <Button onClick={() => { 
              setShowDepositDialog(false);
              navigate('/wallet');
            }}>
              Deposit Funds
            </Button>
            <Button variant="outline" onClick={() => setShowDepositDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
