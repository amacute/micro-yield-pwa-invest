
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Loader } from '@/components/common/Loader';
import { DollarSign, Clock, Users, CheckCircle } from 'lucide-react';

interface Loan {
  id: string;
  lender_id: string;
  borrower_id: string | null;
  amount_lent: number;
  amount_to_repay: number;
  status: string;
  lender_payment_confirmed: boolean;
  borrower_payment_received: boolean;
  borrower_deposit_made: boolean;
  match_date: string | null;
  withdrawal_ready_date: string | null;
  lender_contact: any;
  borrower_contact: any;
  created_at: string;
}

export function P2PLendingDashboard() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [lendAmount, setLendAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLoans();
    }
  }, [user]);

  const fetchLoans = async () => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .or(`lender_id.eq.${user?.id},borrower_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (error: any) {
      console.error('Error fetching loans:', error);
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const createLoanRequest = async () => {
    if (!user || !lendAmount) return;

    setSubmitting(true);
    try {
      const amount = parseFloat(lendAmount);
      if (amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      const lenderContact = {
        fullName: user.name,
        email: user.email,
        phoneNumber: user.phone || '',
        country: user.country || 'US'
      };

      const { error } = await supabase
        .from('loans')
        .insert({
          lender_id: user.id,
          amount_lent: amount,
          amount_to_repay: amount * 2, // 100% profit
          lender_contact: lenderContact,
          status: 'pending_match'
        });

      if (error) throw error;

      toast.success('Loan request created successfully');
      setLendAmount('');
      fetchLoans();
    } catch (error: any) {
      console.error('Error creating loan:', error);
      toast.error('Failed to create loan request');
    } finally {
      setSubmitting(false);
    }
  };

  const simulateAdminMatch = async (loanId: string) => {
    try {
      // Generate dummy borrower data
      const dummyBorrower = {
        id: `borrower_${Date.now()}`,
        fullName: 'John Borrower',
        email: 'borrower@example.com',
        phoneNumber: '+1234567890',
        country: 'US',
        bankName: 'Example Bank',
        accountNumber: '1234567890',
        accountName: 'John Borrower'
      };

      const matchDate = new Date().toISOString();
      const withdrawalReadyDate = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('loans')
        .update({
          borrower_id: dummyBorrower.id,
          borrower_contact: dummyBorrower,
          match_date: matchDate,
          withdrawal_ready_date: withdrawalReadyDate,
          status: 'matched'
        })
        .eq('id', loanId);

      if (error) throw error;

      toast.success('Loan matched successfully');
      fetchLoans();
    } catch (error: any) {
      console.error('Error matching loan:', error);
      toast.error('Failed to match loan');
    }
  };

  const confirmPaymentMade = async (loanId: string) => {
    try {
      const { error } = await supabase
        .from('loans')
        .update({
          lender_payment_confirmed: true,
          status: 'lender_paid'
        })
        .eq('id', loanId);

      if (error) throw error;

      toast.success('Payment confirmed');
      fetchLoans();
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    }
  };

  const confirmPaymentReceived = async (loanId: string) => {
    try {
      const { error } = await supabase
        .from('loans')
        .update({
          borrower_payment_received: true,
          status: 'borrower_received'
        })
        .eq('id', loanId);

      if (error) throw error;

      toast.success('Payment receipt confirmed');
      fetchLoans();
    } catch (error: any) {
      console.error('Error confirming payment receipt:', error);
      toast.error('Failed to confirm payment receipt');
    }
  };

  const makeFreeDeposit = async (loanId: string) => {
    try {
      const { error } = await supabase
        .from('loans')
        .update({
          borrower_deposit_made: true,
          status: 'deposit_made'
        })
        .eq('id', loanId);

      if (error) throw error;

      toast.success('Free deposit completed');
      fetchLoans();
    } catch (error: any) {
      console.error('Error making deposit:', error);
      toast.error('Failed to make deposit');
    }
  };

  const initiateWithdrawal = async (loanId: string) => {
    try {
      const { error } = await supabase
        .from('loans')
        .update({
          status: 'withdrawn'
        })
        .eq('id', loanId);

      if (error) throw error;

      toast.success('Withdrawal initiated successfully');
      fetchLoans();
    } catch (error: any) {
      console.error('Error initiating withdrawal:', error);
      toast.error('Failed to initiate withdrawal');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_match: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Match' },
      matched: { color: 'bg-blue-100 text-blue-800', label: 'Matched' },
      lender_paid: { color: 'bg-purple-100 text-purple-800', label: 'Payment Confirmed' },
      borrower_received: { color: 'bg-green-100 text-green-800', label: 'Payment Received' },
      deposit_made: { color: 'bg-indigo-100 text-indigo-800', label: 'Deposit Made' },
      withdrawn: { color: 'bg-gray-100 text-gray-800', label: 'Withdrawn' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_match;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const isWithdrawalReady = (loan: Loan) => {
    if (!loan.withdrawal_ready_date) return false;
    const now = new Date();
    const readyDate = new Date(loan.withdrawal_ready_date);
    return now >= readyDate && loan.borrower_payment_received && loan.borrower_deposit_made;
  };

  const getTimeRemaining = (withdrawalReadyDate: string) => {
    const now = new Date();
    const readyDate = new Date(withdrawalReadyDate);
    const diff = readyDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ready for withdrawal';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  const lenderLoans = loans.filter(loan => loan.lender_id === user?.id);
  const borrowerLoans = loans.filter(loan => loan.borrower_id === user?.id);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">P2P Lending Dashboard</h1>
        <p className="text-muted-foreground">Manage your lending and borrowing activities</p>
      </div>

      {/* User Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-axiom-primary" />
            <span className="font-medium">User ID: {user?.id}</span>
          </div>
        </CardContent>
      </Card>

      {/* Lender Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Lender Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create Loan Request */}
          <div className="space-y-2">
            <Label htmlFor="lend-amount">Amount to Lend</Label>
            <div className="flex gap-2">
              <Input
                id="lend-amount"
                type="number"
                placeholder="Enter amount"
                value={lendAmount}
                onChange={(e) => setLendAmount(e.target.value)}
              />
              <Button onClick={createLoanRequest} disabled={submitting}>
                {submitting ? 'Creating...' : 'Submit Loan Request'}
              </Button>
            </div>
          </div>

          {/* Active Loan Requests */}
          <div className="space-y-4">
            <h3 className="font-semibold">Your Loan Requests</h3>
            {lenderLoans.length === 0 ? (
              <p className="text-muted-foreground">No loan requests yet</p>
            ) : (
              lenderLoans.map((loan) => (
                <Card key={loan.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Amount: ${loan.amount_lent}</p>
                          <p className="text-sm text-muted-foreground">
                            Expected Return: ${loan.amount_to_repay}
                          </p>
                        </div>
                        {getStatusBadge(loan.status)}
                      </div>

                      {loan.status === 'pending_match' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => simulateAdminMatch(loan.id)}
                        >
                          Admin Match (Test)
                        </Button>
                      )}

                      {loan.borrower_contact && (
                        <div className="p-3 bg-muted rounded">
                          <h4 className="font-medium mb-2">Matched Borrower:</h4>
                          <div className="text-sm space-y-1">
                            <p>Name: {loan.borrower_contact.fullName}</p>
                            <p>Email: {loan.borrower_contact.email}</p>
                            <p>Phone: {loan.borrower_contact.phoneNumber}</p>
                            <p>Country: {loan.borrower_contact.country}</p>
                          </div>
                        </div>
                      )}

                      {loan.status === 'matched' && (
                        <Button
                          size="sm"
                          onClick={() => confirmPaymentMade(loan.id)}
                        >
                          Confirm Payment Made
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Borrower Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Borrower Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="font-semibold">Your Borrow Requests</h3>
          {borrowerLoans.length === 0 ? (
            <p className="text-muted-foreground">No borrow requests assigned</p>
          ) : (
            borrowerLoans.map((loan) => (
              <Card key={loan.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Amount Borrowed: ${loan.amount_lent}</p>
                        <p className="text-sm text-muted-foreground">
                          Amount to Repay: ${loan.amount_to_repay}
                        </p>
                      </div>
                      {getStatusBadge(loan.status)}
                    </div>

                    {loan.lender_contact && (
                      <div className="p-3 bg-muted rounded">
                        <h4 className="font-medium mb-2">Lender Details:</h4>
                        <div className="text-sm space-y-1">
                          <p>Name: {loan.lender_contact.fullName}</p>
                          <p>Email: {loan.lender_contact.email}</p>
                          <p>Phone: {loan.lender_contact.phoneNumber}</p>
                          <p>Country: {loan.lender_contact.country}</p>
                        </div>
                      </div>
                    )}

                    {loan.withdrawal_ready_date && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-700">
                          {getTimeRemaining(loan.withdrawal_ready_date)}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {loan.status === 'lender_paid' && (
                        <Button
                          size="sm"
                          onClick={() => confirmPaymentReceived(loan.id)}
                        >
                          Confirm Payment Received
                        </Button>
                      )}

                      {loan.status === 'borrower_received' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => makeFreeDeposit(loan.id)}
                        >
                          Make Free Deposit
                        </Button>
                      )}

                      {loan.status === 'deposit_made' && (
                        <Button
                          size="sm"
                          disabled={!isWithdrawalReady(loan)}
                          onClick={() => initiateWithdrawal(loan.id)}
                        >
                          {isWithdrawalReady(loan) ? 'Initiate Withdrawal' : 'Withdrawal Not Ready'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
