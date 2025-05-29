import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Investment {
  id: string;
  amount: number;
  created_at: string;
  status: string;
  initial_deposit_confirmed: boolean;
  withdrawal_deposit_confirmed: boolean;
  loan_match?: {
    borrower: {
      name: string;
      email: string;
    };
    amount: number;
    interest_rate: number;
    term_months: number;
  };
}

interface Loan {
  id: string;
  amount: number;
  interest_rate: number;
  term_months: number;
  status: string;
  created_at: string;
  lenders?: {
    name: string;
    email: string;
    amount: number;
  }[];
}

export default function P2PDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [activeView, setActiveView] = useState<'lend' | 'borrow'>('lend');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth/login');
        return;
      }

      // Load investments
      const { data: investmentsData, error: investError } = await supabase
        .from('investment_offers')
        .select(`
          *,
          loan_match:loan_matches(
            borrower:loan_requests(
              user:users(name, email)
            ),
            amount,
            interest_rate,
            term_months
          )
        `)
        .eq('user_id', user.id);

      if (investError) throw investError;

      // Load loans
      const { data: loansData, error: loanError } = await supabase
        .from('loan_requests')
        .select(`
          *,
          loan_matches(
            loan_match_investments(
              investment_offer:investment_offers(
                user:users(name, email)
              ),
              amount
            )
          )
        `)
        .eq('user_id', user.id);

      if (loanError) throw loanError;

      setInvestments(investmentsData || []);
      setLoans(loansData || []);
      
      // Set default view based on user activity
      if (investmentsData?.length && !loansData?.length) {
        setActiveView('lend');
      } else if (!investmentsData?.length && loansData?.length) {
        setActiveView('borrow');
      }
    } catch (error) {
      console.error('Error loading P2P data:', error);
      toast.error('Failed to load P2P information');
    } finally {
      setLoading(false);
    }
  };

  const canWithdraw = (investment: Investment) => {
    if (!investment.initial_deposit_confirmed) return false;
    if (investment.status !== 'matched') return false;
    
    const createdAt = new Date(investment.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff >= 72 && investment.withdrawal_deposit_confirmed;
  };

  const handleWithdraw = async (investmentId: string) => {
    try {
      const { error } = await supabase.rpc('process_investment_withdrawal', {
        p_investment_id: investmentId
      });

      if (error) throw error;

      toast.success('Withdrawal processed successfully!');
      loadUserData();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast.error('Failed to process withdrawal');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">P2P Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your P2P investments and loans
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={activeView === 'lend' ? 'default' : 'outline'}
          onClick={() => setActiveView('lend')}
        >
          Lending
        </Button>
        <Button
          variant={activeView === 'borrow' ? 'default' : 'outline'}
          onClick={() => setActiveView('borrow')}
        >
          Borrowing
        </Button>
      </div>

      {activeView === 'lend' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Investments</CardTitle>
            </CardHeader>
            <CardContent>
              {investments.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    You haven't made any investments yet
                  </p>
                  <Button
                    onClick={() => navigate('/p2p/invest')}
                    className="mt-4"
                  >
                    Start Investing
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {investments.map((investment) => (
                    <Card key={investment.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              ${investment.amount} Investment
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Created {formatDistanceToNow(new Date(investment.created_at))} ago
                            </p>
                            {investment.loan_match && (
                              <div className="mt-2">
                                <p className="text-sm">
                                  Matched with: {investment.loan_match.borrower.name}
                                </p>
                                <p className="text-sm">
                                  Interest Rate: {investment.loan_match.interest_rate}%
                                </p>
                                <p className="text-sm">
                                  Term: {investment.loan_match.term_months} months
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            {investment.status === 'matched' && (
                              <div className="space-y-2">
                                {!investment.initial_deposit_confirmed && (
                                  <div className="flex items-center text-orange-500 text-sm">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    Awaiting initial deposit confirmation
                                  </div>
                                )}
                                {investment.initial_deposit_confirmed && !investment.withdrawal_deposit_confirmed && (
                                  <div className="flex items-center text-orange-500 text-sm">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    Additional deposit required for withdrawal
                                  </div>
                                )}
                                {!canWithdraw(investment) && (
                                  <div className="flex items-center text-sm">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {formatDistanceToNow(
                                      new Date(investment.created_at).getTime() + (72 * 60 * 60 * 1000)
                                    )} until withdrawal
                                  </div>
                                )}
                                <Button
                                  onClick={() => handleWithdraw(investment.id)}
                                  disabled={!canWithdraw(investment)}
                                  className="w-full"
                                >
                                  Withdraw
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === 'borrow' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Loans</CardTitle>
            </CardHeader>
            <CardContent>
              {loans.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    You haven't taken any loans yet
                  </p>
                  <Button
                    onClick={() => navigate('/p2p/borrow')}
                    className="mt-4"
                  >
                    Request a Loan
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {loans.map((loan) => (
                    <Card key={loan.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              ${loan.amount} Loan
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Created {formatDistanceToNow(new Date(loan.created_at))} ago
                            </p>
                            <div className="mt-2">
                              <p className="text-sm">Interest Rate: {loan.interest_rate}%</p>
                              <p className="text-sm">Term: {loan.term_months} months</p>
                              {loan.status === 'matched' && loan.lenders && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium">Lenders:</p>
                                  {loan.lenders.map((lender, index) => (
                                    <p key={index} className="text-sm">
                                      {lender.name} - ${lender.amount}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                              {loan.status}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 