import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LoanRequest {
  id: string;
  user_id: string;
  amount: number;
  interest_rate: number;
  term_months: number;
  status: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
}

interface InvestmentOffer {
  id: string;
  user_id: string;
  amount: number;
  min_interest_rate: number;
  max_term_months: number;
  status: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
}

export default function LoanMatching() {
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [investmentOffers, setInvestmentOffers] = useState<InvestmentOffer[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [selectedInvestments, setSelectedInvestments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch pending loan requests
      const { data: loans, error: loanError } = await supabase
        .from('loan_requests')
        .select(`
          *,
          user:user_id (
            name,
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (loanError) throw loanError;

      // Fetch available investment offers
      const { data: investments, error: investError } = await supabase
        .from('investment_offers')
        .select(`
          *,
          user:user_id (
            name,
            email
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (investError) throw investError;

      setLoanRequests(loans || []);
      setInvestmentOffers(investments || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load matching data');
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    if (!selectedLoan || selectedInvestments.length === 0) {
      toast.error('Please select both loan request and investment offers');
      return;
    }

    try {
      const loan = loanRequests.find(l => l.id === selectedLoan);
      const investments = investmentOffers.filter(i => 
        selectedInvestments.includes(i.id)
      );

      // Calculate total investment amount
      const totalInvestmentAmount = investments.reduce(
        (sum, inv) => sum + inv.amount,
        0
      );

      // Verify total amount matches loan amount
      if (totalInvestmentAmount !== loan?.amount) {
        toast.error('Total investment amount must match loan amount');
        return;
      }

      // Create the match
      const { error: matchError } = await supabase.rpc('create_loan_match', {
        p_loan_request_id: selectedLoan,
        p_investment_ids: selectedInvestments
      });

      if (matchError) throw matchError;

      toast.success('Loan successfully matched!');
      
      // Reset selection and refresh data
      setSelectedLoan(null);
      setSelectedInvestments([]);
      fetchData();
    } catch (error) {
      console.error('Error matching loan:', error);
      toast.error('Failed to create loan match');
    }
  };

  if (loading) {
    return <div>Loading matching data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Loan Matching</h1>
        <p className="text-muted-foreground">
          Manually match loan requests with investment offers
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Loan Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Loan Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Term</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loanRequests.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <input
                        type="radio"
                        name="loanRequest"
                        checked={selectedLoan === loan.id}
                        onChange={() => setSelectedLoan(loan.id)}
                      />
                    </TableCell>
                    <TableCell>{loan.user.name}</TableCell>
                    <TableCell>${loan.amount}</TableCell>
                    <TableCell>{loan.interest_rate}%</TableCell>
                    <TableCell>{loan.term_months} months</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Investment Offers */}
        <Card>
          <CardHeader>
            <CardTitle>Available Investment Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>Investor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Min Rate</TableHead>
                  <TableHead>Max Term</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investmentOffers.map((investment) => (
                  <TableRow key={investment.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedInvestments.includes(investment.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInvestments([...selectedInvestments, investment.id]);
                          } else {
                            setSelectedInvestments(
                              selectedInvestments.filter(id => id !== investment.id)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{investment.user.name}</TableCell>
                    <TableCell>${investment.amount}</TableCell>
                    <TableCell>{investment.min_interest_rate}%</TableCell>
                    <TableCell>{investment.max_term_months} months</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Match Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Selected Loan Request</Label>
              <div className="p-2 bg-muted rounded">
                {selectedLoan ? (
                  <p>
                    {loanRequests.find(l => l.id === selectedLoan)?.user.name} - $
                    {loanRequests.find(l => l.id === selectedLoan)?.amount}
                  </p>
                ) : (
                  <p className="text-muted-foreground">No loan request selected</p>
                )}
              </div>
            </div>

            <div>
              <Label>Selected Investments</Label>
              <div className="p-2 bg-muted rounded">
                {selectedInvestments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedInvestments.map(id => {
                      const inv = investmentOffers.find(i => i.id === id);
                      return (
                        <p key={id}>
                          {inv?.user.name} - ${inv?.amount}
                        </p>
                      );
                    })}
                    <p className="font-bold border-t pt-2">
                      Total: $
                      {selectedInvestments
                        .reduce((sum, id) => {
                          const inv = investmentOffers.find(i => i.id === id);
                          return sum + (inv?.amount || 0);
                        }, 0)
                      }
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No investments selected</p>
                )}
              </div>
            </div>

            <Button
              onClick={handleMatch}
              disabled={!selectedLoan || selectedInvestments.length === 0}
              className="w-full"
            >
              Create Match
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 