
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Clock, DollarSign, Users, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LendingOffer {
  id: string;
  amount: number;
  status: 'pending' | 'matched' | 'completed';
  created_at: string;
  withdrawal_enabled: boolean;
  profit_amount?: number;
}

interface FreshDeposit {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  lending_offer_id: string;
}

export default function P2PLending() {
  const { user } = useAuth();
  const [lendingAmount, setLendingAmount] = useState<string>('');
  const [currentOffer, setCurrentOffer] = useState<LendingOffer | null>(null);
  const [freshDeposit, setFreshDeposit] = useState<FreshDeposit | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load current lending offer
      const { data: offers, error: offersError } = await supabase
        .from('p2p_lending_offers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (offersError) throw offersError;

      if (offers && offers.length > 0) {
        setCurrentOffer(offers[0]);

        // Load fresh deposit if offer exists
        const { data: deposits, error: depositsError } = await supabase
          .from('p2p_fresh_deposits')
          .select('*')
          .eq('lending_offer_id', offers[0].id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (depositsError) throw depositsError;

        if (deposits && deposits.length > 0) {
          setFreshDeposit(deposits[0]);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load your P2P data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async () => {
    if (!user || !lendingAmount) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(lendingAmount);
    if (amount < 10) {
      toast.error('Minimum lending amount is $10');
      return;
    }

    if (amount > (user.walletBalance || 0)) {
      toast.error('Insufficient wallet balance');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('p2p_lending_offers')
        .insert({
          user_id: user.id,
          amount: amount,
          status: 'pending',
          withdrawal_enabled: false
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentOffer(data);
      setLendingAmount('');
      toast.success('Lending offer created successfully! Wait 72 hours for matching.');
    } catch (error) {
      console.error('Error creating offer:', error);
      toast.error('Failed to create lending offer');
    }
  };

  const handleFreshDeposit = async () => {
    if (!currentOffer || !depositAmount) {
      toast.error('Please enter a valid deposit amount');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('p2p_fresh_deposits')
        .insert({
          user_id: user?.id,
          lending_offer_id: currentOffer.id,
          amount: amount,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setFreshDeposit(data);
      setDepositAmount('');
      toast.success('Fresh deposit submitted! Waiting for admin approval.');
    } catch (error) {
      console.error('Error submitting deposit:', error);
      toast.error('Failed to submit deposit');
    }
  };

  const handleWithdraw = async () => {
    if (!currentOffer) return;

    try {
      // Calculate 100% profit
      const profitAmount = currentOffer.amount * 2; // 100% profit means double the amount

      // Update offer status to completed
      const { error } = await supabase
        .from('p2p_lending_offers')
        .update({ 
          status: 'completed',
          profit_amount: profitAmount
        })
        .eq('id', currentOffer.id);

      if (error) throw error;

      toast.success(`Withdrawal successful! You received $${profitAmount.toFixed(2)} (100% profit)`);
      loadUserData();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast.error('Failed to process withdrawal');
    }
  };

  const getTimeRemaining = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursElapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    const hoursRemaining = Math.max(0, 72 - hoursElapsed);
    
    if (hoursRemaining === 0) {
      return 'Ready for matching';
    }
    
    const days = Math.floor(hoursRemaining / 24);
    const hours = Math.floor(hoursRemaining % 24);
    const minutes = Math.floor((hoursRemaining % 1) * 60);
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const isReadyForMatching = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursElapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return hoursElapsed >= 72;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">P2P Lending</h1>
        <p className="text-muted-foreground">
          Lend money, wait 72 hours, get matched, make a fresh deposit, and withdraw with 100% profit
        </p>
      </div>

      {/* Create New Lending Offer */}
      {!currentOffer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Create Lending Offer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Lending Amount</label>
              <Input
                type="number"
                value={lendingAmount}
                onChange={(e) => setLendingAmount(e.target.value)}
                placeholder="Enter amount to lend"
                min="10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available balance: ${user?.walletBalance?.toFixed(2) || '0.00'}
              </p>
            </div>
            <Button 
              onClick={handleCreateOffer}
              disabled={!lendingAmount || parseFloat(lendingAmount) < 10}
              className="w-full"
            >
              Create Lending Offer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Current Offer Status */}
      {currentOffer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Your Lending Offer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount Lent</p>
                <p className="text-2xl font-bold">${currentOffer.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={currentOffer.status === 'pending' ? 'secondary' : 
                              currentOffer.status === 'matched' ? 'default' : 'outline'}>
                  {currentOffer.status.charAt(0).toUpperCase() + currentOffer.status.slice(1)}
                </Badge>
              </div>
            </div>

            {currentOffer.status === 'pending' && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="font-medium text-blue-800 mb-2">Waiting Period</h4>
                <p className="text-sm text-blue-700">
                  {getTimeRemaining(currentOffer.created_at)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Created {formatDistanceToNow(new Date(currentOffer.created_at))} ago
                </p>
              </div>
            )}

            {currentOffer.status === 'matched' && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Matched with Other Lenders!
                </h4>
                <p className="text-sm text-green-700 mb-3">
                  You have been matched with other lenders. Make a fresh deposit to enable withdrawal.
                </p>
                
                {!freshDeposit && (
                  <div className="space-y-3">
                    <Input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Enter fresh deposit amount"
                      min="1"
                    />
                    <Button onClick={handleFreshDeposit} size="sm">
                      Submit Fresh Deposit
                    </Button>
                  </div>
                )}

                {freshDeposit && (
                  <div className="mt-3">
                    <p className="text-sm text-green-700">
                      Fresh deposit: ${freshDeposit.amount.toFixed(2)} ({freshDeposit.status})
                    </p>
                    {freshDeposit.status === 'approved' && currentOffer.withdrawal_enabled && (
                      <Button 
                        onClick={handleWithdraw}
                        className="mt-2"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Withdraw ${(currentOffer.amount * 2).toFixed(2)} (100% Profit)
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentOffer.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completed Successfully!
                </h4>
                <p className="text-sm text-green-700">
                  You withdrew ${currentOffer.profit_amount?.toFixed(2)} with 100% profit!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>How P2P Lending Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <h4 className="font-medium">Create a Lending Offer</h4>
                <p className="text-sm text-muted-foreground">Choose how much you want to lend (minimum $10)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <h4 className="font-medium">Wait 72 Hours</h4>
                <p className="text-sm text-muted-foreground">Your offer becomes eligible for admin matching after 72 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <h4 className="font-medium">Get Matched</h4>
                <p className="text-sm text-muted-foreground">Admin matches you with other lenders based on withdrawal amounts</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">4</div>
              <div>
                <h4 className="font-medium">Make Fresh Deposit</h4>
                <p className="text-sm text-muted-foreground">Submit a fresh deposit to enable withdrawal</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">5</div>
              <div>
                <h4 className="font-medium">Withdraw with 100% Profit</h4>
                <p className="text-sm text-muted-foreground">Once approved, withdraw double your original amount</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
