import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/supabase';
import {
  DollarSign,
  Wallet,
  TrendingUp,
  Clock,
  Send,
  Receive,
  Package,
  Coins,
} from 'lucide-react';

// Define types for clarity
type Profile = Tables['profiles'];
type Loan = Tables['loans'] & {
  requester?: Profile;
  matched_by?: Profile;
};

export default function P2PLendingDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myLoans, setMyLoans] = useState<Loan[]>([]);
  const [openLoanRequests, setOpenLoanRequests] = useState<Loan[]>([]);
  const [openLoanOffers, setOpenLoanOffers] = useState<Loan[]>([]);
  const [activeTab, setActiveTab] = useState<'my_loans' | 'borrow_requests' | 'lend_offers'>('my_loans');
  const [loading, setLoading] = useState(true);

  // State for Request/Offer Loan Dialog
  const [isRequestLoanOpen, setIsRequestLoanOpen] = useState(false);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanInterestRate, setLoanInterestRate] = useState('');
  const [loanDuration, setLoanDuration] = useState('');
  const [loanType, setLoanType] = useState<'borrow_request' | 'lend_offer'>('borrow_request');

  // State for Withdraw Dialog
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // State for countdown timers
  const [countdowns, setCountdowns] = useState<{ [key: string]: string | null }>({});

  // Utility function to calculate time left for withdrawal
  const calculateTimeLeft = (matchDate: string | null) => {
    if (!matchDate) return null;
    const matchedAt = new Date(matchDate);
    const seventyTwoHoursLater = new Date(matchedAt.getTime() + 72 * 60 * 60 * 1000);
    const now = new Date();
    const timeLeftMs = seventyTwoHoursLater.getTime() - now.getTime();

    if (timeLeftMs <= 0) return 'Ready to Withdraw';

    const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Update countdown timers
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdowns(prev => {
        const newCountdowns = { ...prev };
        myLoans.forEach(loan => {
          if (loan.status === 'matched' && loan.matched_at) {
            newCountdowns[loan.id] = calculateTimeLeft(loan.matched_at);
          }
        });
        return newCountdowns;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [myLoans]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch loans for current user
      const { data: userLoans, error: userLoansError } = await supabase
        .from('loans')
        .select(`
          *,
          requester:profiles!requester_id(*),
          matched_by:profiles!matched_by_id(*)
        `)
        .or(`requester_id.eq.${user.id},matched_by_id.eq.${user.id}`);

      if (userLoansError) throw userLoansError;
      setMyLoans(userLoans);

      // Fetch open loan requests
      const { data: openRequests, error: requestsError } = await supabase
        .from('loans')
        .select(`
          *,
          requester:profiles!requester_id(*)
        `)
        .eq('type', 'borrow_request')
        .eq('status', 'pending')
        .neq('requester_id', user.id);

      if (requestsError) throw requestsError;
      setOpenLoanRequests(openRequests);

      // Fetch open loan offers
      const { data: openOffers, error: offersError } = await supabase
        .from('loans')
        .select(`
          *,
          requester:profiles!requester_id(*)
        `)
        .eq('type', 'lend_offer')
        .eq('status', 'pending')
        .neq('requester_id', user.id);

      if (offersError) throw offersError;
      setOpenLoanOffers(openOffers);

    } catch (error) {
      console.error('Error fetching P2P dashboard data:', error);
      toast.error('Failed to load P2P data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    fetchDashboardData();

    const channel = supabase
      .channel('p2p_loans_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, payload => {
        console.log('Real-time change received:', payload);
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData]);

  // Handle Create Loan
  const handleCreateLoan = async () => {
    if (!user || !profile) {
      toast.error("User profile not loaded. Please try again.");
      return;
    }
    const amountNum = parseFloat(loanAmount);
    const interestNum = parseFloat(loanInterestRate);
    const durationNum = parseInt(loanDuration, 10);

    if (isNaN(amountNum) || amountNum <= 0 ||
        isNaN(interestNum) || interestNum < 0 ||
        isNaN(durationNum) || durationNum <= 0) {
      toast.error("Please enter valid positive numbers for amount, interest, and duration.");
      return;
    }

    if (loanType === 'lend_offer' && profile.wallet_balance < amountNum) {
      toast.error("You don't have enough balance to offer this loan.");
      return;
    }

    setLoading(true);
    try {
      const newLoan = {
        requester_id: user.id,
        type: loanType,
        amount: amountNum,
        interest_rate: interestNum,
        duration_months: durationNum,
        status: 'pending',
      };

      const { error } = await supabase.from('loans').insert([newLoan]);

      if (error) throw error;

      toast.success(`${loanType === 'borrow_request' ? 'Loan request' : 'Loan offer'} created successfully!`);
      setIsRequestLoanOpen(false);
      setLoanAmount('');
      setLoanInterestRate('');
      setLoanDuration('');
    } catch (error) {
      console.error('Error creating loan:', error);
      toast.error(error.message || 'Failed to create loan.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Fund Loan Request
  const handleFundLoanRequest = async (loanToFund: Loan) => {
    if (!user || !profile) {
      toast.error("User profile not loaded.");
      return;
    }
    const amount = parseFloat(loanToFund.amount.toString());
    if (profile.wallet_balance < amount) {
      toast.error("Insufficient balance to fund this loan.");
      return;
    }

    setLoading(true);
    try {
      const { error: loanUpdateError } = await supabase
        .from('loans')
        .update({
          status: 'matched',
          matched_by_id: user.id,
          matched_at: new Date().toISOString(),
          amount_to_repay: amount * 2
        })
        .eq('id', loanToFund.id);

      if (loanUpdateError) throw loanUpdateError;

      const newWalletBalance = parseFloat(profile.wallet_balance.toString()) - amount;
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newWalletBalance, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (profileUpdateError) throw profileUpdateError;

      setProfile(prev => prev ? { ...prev, wallet_balance: newWalletBalance } : null);

      toast.success(`Loan of ₦${amount.toFixed(2)} funded successfully!`);
    } catch (error) {
      console.error('Error funding loan:', error);
      toast.error(error.message || 'Failed to fund loan.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Lender Payment Confirmation
  const handleLenderPaymentConfirmed = async (loanId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('loans')
        .update({ status: 'lender_paid', lender_payment_confirmed: true })
        .eq('id', loanId);

      if (error) throw error;
      toast.success('Payment confirmation recorded!');
    } catch (error) {
      console.error('Error confirming lender payment:', error);
      toast.error(error.message || 'Failed to confirm payment.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Borrower Payment Received
  const handleBorrowerPaymentReceived = async (loanId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('loans')
        .update({ status: 'borrower_received', borrower_payment_received: true })
        .eq('id', loanId);

      if (error) throw error;
      toast.success('Payment received confirmation recorded!');
    } catch (error) {
      console.error('Error confirming borrower payment received:', error);
      toast.error(error.message || 'Failed to confirm payment receipt.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Borrower Deposit
  const handleBorrowerDepositMade = async (loanId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('loans')
        .update({ status: 'deposit_made', borrower_deposit_made: true })
        .eq('id', loanId);

      if (error) throw error;
      toast.success('Mandatory deposit confirmed!');
    } catch (error) {
      console.error('Error confirming borrower deposit:', error);
      toast.error(error.message || 'Failed to confirm deposit.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Withdrawal
  const handleInitiateWithdrawal = async (loanId: string, amountToRepay: number) => {
    setLoading(true);
    try {
      const { error: loanUpdateError } = await supabase
        .from('loans')
        .update({ status: 'withdrawn' })
        .eq('id', loanId);

      if (loanUpdateError) throw loanUpdateError;

      const newWalletBalance = parseFloat(profile!.wallet_balance.toString()) + amountToRepay;
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newWalletBalance, updated_at: new Date().toISOString() })
        .eq('id', user!.id);

      if (profileUpdateError) throw profileUpdateError;

      setProfile(prev => prev ? { ...prev, wallet_balance: newWalletBalance } : null);

      toast.success(`₦${amountToRepay.toFixed(2)} successfully withdrawn to your wallet!`);
    } catch (error) {
      console.error('Error initiating withdrawal:', error);
      toast.error(error.message || 'Failed to initiate withdrawal.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Withdraw Funds from Wallet
  const handleWithdrawFunds = async () => {
    if (!user || !profile) {
      toast.error("User profile not loaded.");
      return;
    }
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0 || amountNum > parseFloat(profile.wallet_balance.toString())) {
      toast.error("Please enter a valid amount within your balance.");
      return;
    }

    setLoading(true);
    try {
      const newBalance = parseFloat(profile.wallet_balance.toString()) - amountNum;
      const { error } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, wallet_balance: newBalance } : null);
      toast.success(`₦${amountNum.toFixed(2)} withdrawn successfully!`);
      setIsWithdrawOpen(false);
      setWithdrawAmount('');
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast.error(error.message || 'Withdrawal failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        Please log in to access the P2P Dashboard.
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 w-full max-w-6xl mx-auto">
      {/* User ID Display */}
      <Card className="bg-[#1C1C1C] text-white p-4 rounded-lg shadow-lg border border-[#333333] text-center">
        <p className="text-lg font-semibold text-primary">Your User ID:</p>
        <p className="text-sm break-all text-gray-300">{user.id}</p>
      </Card>

      {/* Top Section: Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1C1C1C] text-white p-6 rounded-lg shadow-lg border border-[#333333]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Profit</h3>
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <p className="text-3xl font-bold text-primary">
            ₦{profile?.wallet_balance ? parseFloat(profile.wallet_balance.toString()).toFixed(2) : '0.00'}
          </p>
        </Card>

        <Card className="bg-[#1C1C1C] text-white p-6 rounded-lg shadow-lg border border-[#333333]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Funds in Wallet</h3>
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <p className="text-3xl font-bold text-primary">
            ₦{profile?.wallet_balance ? parseFloat(profile.wallet_balance.toString()).toFixed(2) : '0.00'}
          </p>
          <Button
            variant="outline"
            className="mt-4 w-full text-primary border-primary hover:bg-primary/10"
            onClick={() => setIsWithdrawOpen(true)}
          >
            Withdraw Funds
          </Button>
        </Card>

        <Card className="bg-[#1C1C1C] text-white p-6 rounded-lg shadow-lg border border-[#333333]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">My Active Loans</h3>
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <p className="text-3xl font-bold text-primary">
            {myLoans.filter(loan => 
              ['matched', 'lender_paid', 'borrower_received', 'deposit_made'].includes(loan.status)
            ).length}
          </p>
          <Button
            variant="outline"
            className="mt-4 w-full text-primary border-primary hover:bg-primary/10"
            onClick={() => setIsRequestLoanOpen(true)}
          >
            Request/Offer Loan
          </Button>
        </Card>
      </div>

      {/* Tabs for Loan Categories */}
      <div className="flex justify-center gap-2 bg-[#1C1C1C] p-2 rounded-lg shadow-lg border border-[#333333]">
        <Button
          variant={activeTab === 'my_loans' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('my_loans')}
          className={`flex-1 ${activeTab === 'my_loans' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
        >
          My Loans ({myLoans.length})
        </Button>
        <Button
          variant={activeTab === 'borrow_requests' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('borrow_requests')}
          className={`flex-1 ${activeTab === 'borrow_requests' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Borrow Requests ({openLoanRequests.length})
        </Button>
        <Button
          variant={activeTab === 'lend_offers' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('lend_offers')}
          className={`flex-1 ${activeTab === 'lend_offers' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Lend Offers ({openLoanOffers.length})
        </Button>
      </div>

      {/* Loan Listings */}
      <div className="space-y-4">
        {/* My Loans Tab */}
        {activeTab === 'my_loans' && (
          myLoans.length === 0 ? (
            <p className="text-gray-400 text-center py-8">You have no active or pending loans.</p>
          ) : (
            myLoans.map((loan) => (
              <Card key={loan.id} className="bg-[#1C1C1C] p-4 rounded-lg shadow-sm border border-[#333333] text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-lg font-semibold capitalize">
                    {loan.type.replace('_', ' ')}: ₦{parseFloat(loan.amount.toString()).toFixed(2)}
                  </p>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    loan.status === 'pending' ? 'bg-yellow-800 text-yellow-200' :
                    loan.status === 'matched' ? 'bg-blue-800 text-blue-200' :
                    loan.status === 'lender_paid' ? 'bg-purple-800 text-purple-200' :
                    loan.status === 'borrower_received' ? 'bg-green-800 text-green-200' :
                    loan.status === 'deposit_made' ? 'bg-indigo-800 text-indigo-200' :
                    loan.status === 'withdrawable' ? 'bg-teal-800 text-teal-200' :
                    loan.status === 'withdrawn' ? 'bg-gray-700 text-gray-300' :
                    'bg-gray-600 text-gray-300'
                  }`}>
                    {loan.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  {loan.interest_rate}% interest, {loan.duration_months} months
                </p>
                {loan.amount_to_repay && (
                  <p className="text-gray-400 text-sm">Amount to Repay: ₦{parseFloat(loan.amount_to_repay.toString()).toFixed(2)}</p>
                )}

                {/* Loan Actions */}
                {loan.status !== 'pending' && loan.status !== 'withdrawn' && (
                  <div className="mt-4 pt-4 border-t border-[#2A2A2A] space-y-4">
                    {/* Lender Actions */}
                    {loan.matched_by_id === user.id && (
                      <div className="space-y-2">
                        <p className="font-semibold text-primary">Lender Actions:</p>
                        {loan.status === 'matched' && !loan.lender_payment_confirmed && (
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleLenderPaymentConfirmed(loan.id)}
                            disabled={loading}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Confirm Payment Made
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Borrower Actions */}
                    {loan.requester_id === user.id && (
                      <div className="space-y-2">
                        <p className="font-semibold text-primary">Borrower Actions:</p>
                        {loan.status === 'lender_paid' && !loan.borrower_payment_received && (
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleBorrowerPaymentReceived(loan.id)}
                            disabled={loading}
                          >
                            <Receive className="w-4 h-4 mr-2" />
                            Confirm Payment Received
                          </Button>
                        )}
                        {loan.status === 'borrower_received' && !loan.borrower_deposit_made && (
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleBorrowerDepositMade(loan.id)}
                            disabled={loading}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Make Free Deposit
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Withdrawal Timer */}
                    {loan.matched_at && (
                      <div className="text-center">
                        <p className="text-sm text-gray-400 flex items-center justify-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {countdowns[loan.id] || 'Calculating...'}
                        </p>
                      </div>
                    )}

                    {/* Withdrawal Action */}
                    {loan.status === 'deposit_made' && countdowns[loan.id] === 'Ready to Withdraw' && (
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => handleInitiateWithdrawal(loan.id, parseFloat(loan.amount_to_repay!.toString()))}
                        disabled={loading}
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        Initiate Withdrawal
                      </Button>
                    )}
                  </div>
                )}

                {/* Contact Details */}
                {loan.status !== 'pending' && (
                  <div className="mt-4 pt-4 border-t border-[#2A2A2A] text-sm">
                    <p className="font-semibold text-primary mb-2">Contact Details:</p>
                    {loan.requester_id === user.id ? (
                      loan.matched_by ? (
                        <>
                          <p>Lender: {loan.matched_by.full_name}</p>
                          <p>Email: {loan.matched_by.email}</p>
                          <p>Phone: {loan.matched_by.phone_number || 'N/A'}</p>
                          <p>Country: {loan.matched_by.country || 'N/A'}</p>
                        </>
                      ) : (
                        <p>Waiting for a match...</p>
                      )
                    ) : (
                      loan.requester && (
                        <>
                          <p>Borrower: {loan.requester.full_name}</p>
                          <p>Email: {loan.requester.email}</p>
                          <p>Phone: {loan.requester.phone_number || 'N/A'}</p>
                          <p>Country: {loan.requester.country || 'N/A'}</p>
                        </>
                      )
                    )}
                  </div>
                )}
              </Card>
            ))
          )
        )}

        {/* Borrow Requests Tab */}
        {activeTab === 'borrow_requests' && (
          openLoanRequests.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No open borrow requests available.</p>
          ) : (
            openLoanRequests.map((loan) => (
              <Card key={loan.id} className="bg-[#1C1C1C] p-4 rounded-lg shadow-sm border border-[#333333] flex items-center justify-between text-white">
                <div>
                  <p className="text-lg font-semibold">
                    Borrow Request: ₦{parseFloat(loan.amount.toString()).toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {loan.interest_rate}% interest, {loan.duration_months} months
                  </p>
                  {loan.requester && (
                    <p className="text-gray-400 text-xs">
                      By: {loan.requester.full_name} ({loan.requester.country || 'N/A'})
                    </p>
                  )}
                </div>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleFundLoanRequest(loan)}
                  disabled={loading}
                >
                  Fund Loan
                </Button>
              </Card>
            ))
          )
        )}

        {/* Lend Offers Tab */}
        {activeTab === 'lend_offers' && (
          openLoanOffers.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No open lend offers available.</p>
          ) : (
            openLoanOffers.map((loan) => (
              <Card key={loan.id} className="bg-[#1C1C1C] p-4 rounded-lg shadow-sm border border-[#333333] flex items-center justify-between text-white">
                <div>
                  <p className="text-lg font-semibold">
                    Lend Offer: ₦{parseFloat(loan.amount.toString()).toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {loan.interest_rate}% interest, {loan.duration_months} months
                  </p>
                  {loan.requester && (
                    <p className="text-gray-400 text-xs">
                      By: {loan.requester.full_name} ({loan.requester.country || 'N/A'})
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="text-primary border-primary hover:bg-primary/10"
                  onClick={() => toast.info("Functionality to accept offer coming soon!")}
                  disabled={loading}
                >
                  View Details
                </Button>
              </Card>
            ))
          )
        )}
      </div>

      {/* Request/Offer Loan Dialog */}
      <Dialog open={isRequestLoanOpen} onOpenChange={setIsRequestLoanOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#1C1C1C] text-white border border-[#333333]">
          <DialogHeader>
            <DialogTitle className="text-primary">Request or Offer a Loan</DialogTitle>
            <DialogDescription className="text-gray-400">
              Fill in the details for your P2P loan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="loanType" className="text-right text-gray-300">
                Type
              </Label>
              <Select value={loanType} onValueChange={(value) => setLoanType(value as 'borrow_request' | 'lend_offer')}>
                <SelectTrigger className="col-span-3 bg-[#0A0A0A] text-white border border-[#333333]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] text-white border border-[#333333]">
                  <SelectItem value="borrow_request">Borrow Request</SelectItem>
                  <SelectItem value="lend_offer">Lend Offer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right text-gray-300">
                Amount (₦)
              </Label>
              <Input
                id="amount"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="col-span-3 bg-[#0A0A0A] text-white border border-[#333333]"
                placeholder="e.g., 50000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interest" className="text-right text-gray-300">
                Interest (%)
              </Label>
              <Input
                id="interest"
                type="number"
                value={loanInterestRate}
                onChange={(e) => setLoanInterestRate(e.target.value)}
                className="col-span-3 bg-[#0A0A0A] text-white border border-[#333333]"
                placeholder="e.g., 10"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right text-gray-300">
                Duration (Months)
              </Label>
              <Input
                id="duration"
                type="number"
                value={loanDuration}
                onChange={(e) => setLoanDuration(e.target.value)}
                className="col-span-3 bg-[#0A0A0A] text-white border border-[#333333]"
                placeholder="e.g., 6"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleCreateLoan}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {loading ? 'Submitting...' : 'Submit Loan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Funds Dialog */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#1C1C1C] text-white border border-[#333333]">
          <DialogHeader>
            <DialogTitle className="text-primary">Withdraw Funds</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the amount you wish to withdraw from your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="withdrawAmount" className="text-right text-gray-300">
                Amount (₦)
              </Label>
              <Input
                id="withdrawAmount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="col-span-3 bg-[#0A0A0A] text-white border border-[#333333]"
                placeholder="e.g., 10000"
              />
            </div>
            <p className="col-span-4 text-center text-gray-400 text-sm">
              Current Balance: ₦{profile?.wallet_balance ? parseFloat(profile.wallet_balance.toString()).toFixed(2) : '0.00'}
            </p>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleWithdrawFunds}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {loading ? 'Processing...' : 'Withdraw'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 