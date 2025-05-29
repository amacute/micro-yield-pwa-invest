
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Clock, DollarSign, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface P2PLendingOffer {
  id: string;
  amount: number;
  created_at: string;
  status: 'pending' | 'active' | 'matched' | 'completed';
  lending_end_time?: string;
  profit_earned?: number;
  withdrawal_enabled: boolean;
  fresh_deposit_made: boolean;
  fresh_deposit_amount?: number;
}

interface P2PMatch {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  lending_end_time?: string;
  borrower?: {
    name: string;
    email: string;
  };
}

export default function P2PLending() {
  const { user } = useAuth();
  const [lendingAmount, setLendingAmount] = useState<string>('');
  const [freshDepositAmount, setFreshDepositAmount] = useState<string>('');
  const [myLendingOffers, setMyLendingOffers] = useState<P2PLendingOffer[]>([]);
  const [myMatches, setMyMatches] = useState<P2PMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserP2PData();
    }
  }, [user]);

  const loadUserP2PData = async () => {
    try {
      // Load user's lending offers
      const { data: offers, error: offersError } = await supabase
        .from('p2p_lending_offers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (offersError) throw offersError;

      // Load user's matches as a lender
      const { data: matches, error: matchesError } = await supabase
        .from('lending_match_contributions')
        .select(`
          *,
          lending_matches:match_id (
            borrower_id,
            total_amount,
            status,
            users:borrower_id (name, email)
          )
        `)
        .eq('lender_id', user?.id)
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;

      setMyLendingOffers(offers || []);
      setMyMatches(matches || []);
    } catch (error) {
      console.error('Error loading P2P data:', error);
      toast.error('Failed to load P2P data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLendingOffer = async () => {
    if (!lendingAmount || parseFloat(lendingAmount) <= 0) {
      toast.error('Please enter a valid lending amount');
      return;
    }

    if (parseFloat(lendingAmount) > (user?.walletBalance || 0)) {
      toast.error('Insufficient wallet balance');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('p2p_lending_offers')
        .insert({
          user_id: user?.id,
          amount: parseFloat(lendingAmount),
          status: 'pending'
        });

      if (error) throw error;

      // Deduct amount from wallet
      const { error: walletError } = await supabase
        .from('users')
        .update({
          wallet_balance: (user?.walletBalance || 0) - parseFloat(lendingAmount)
        })
        .eq('user_id', user?.id);

      if (walletError) throw walletError;

      toast.success('Lending offer created successfully! 72-hour countdown has started.');
      setLendingAmount('');
      loadUserP2PData();
    } catch (error) {
      console.error('Error creating lending offer:', error);
      toast.error('Failed to create lending offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFreshDeposit = async (offerId: string) => {
    if (!freshDepositAmount || parseFloat(freshDepositAmount) <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }

    try {
      const { error } = await supabase
        .from('p2p_fresh_deposits')
        .insert({
          user_id: user?.id,
          lending_offer_id: offerId,
          amount: parseFloat(freshDepositAmount),
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Fresh deposit request submitted. Admin will verify and approve.');
      setFreshDepositAmount('');
      loadUserP2PData();
    } catch (error) {
      console.error('Error submitting fresh deposit:', error);
      toast.error('Failed to submit fresh deposit');
    }
  };

  const handleWithdraw = async (matchId: string, originalAmount: number) => {
    try {
      const totalWithdrawal = originalAmount * 2; // 100% profit

      // Add to wallet
      const { error: walletError } = await supabase
        .from('users')
        .update({
          wallet_balance: (user?.walletBalance || 0) + totalWithdrawal
        })
        .eq('user_id', user?.id);

      if (walletError) throw walletError;

      // Update match status
      const { error: matchError } = await supabase
        .from('lending_match_contributions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          profit_amount: originalAmount
        })
        .eq('contribution_id', matchId);

      if (matchError) throw matchError;

      toast.success(`Successfully withdrew ${user?.currencySymbol}${totalWithdrawal.toFixed(2)} (100% profit included)!`);
      loadUserP2PData();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast.error('Failed to process withdrawal');
    }
  };

  const canBeMatched = (offer: P2PLendingOffer) => {
    if (offer.status !== 'pending') return false;
    const createdTime = new Date(offer.created_at);
    const now = new Date();
    const hoursPassed = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60);
    return hoursPassed >= 72;
  };

  const canWithdraw = (match: P2PMatch) => {
    return match.status === 'active' && match.lending_end_time && 
           new Date() >= new Date(match.lending_end_time);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">P2P Lending Platform</h1>
        <p className="text-muted-foreground">
          Lend money, wait 72 hours, get matched, and earn 100% profit
        </p>
      </div>

      {/* Create Lending Offer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Create Lending Offer
          </CardTitle>
          <CardDescription>
            Start by lending money. After 72 hours, admin can match you with borrowers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Lending Amount</label>
            <Input
              type="number"
              placeholder="Enter amount to lend"
              value={lendingAmount}
              onChange={(e) => setLendingAmount(e.target.value)}
              min="10"
              step="0.01"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Available balance: {user?.currencySymbol}{user?.walletBalance?.toFixed(2) || '0.00'}
            </p>
          </div>
          <Button
            onClick={handleCreateLendingOffer}
            disabled={!lendingAmount || submitting || parseFloat(lendingAmount) > (user?.walletBalance || 0)}
            className="w-full"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <DollarSign className="h-4 w-4 mr-2" />
            )}
            Create Lending Offer
          </Button>
        </CardContent>
      </Card>

      {/* My Lending Offers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            My Lending Offers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myLendingOffers.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No lending offers yet. Create your first offer above.
            </p>
          ) : (
            <div className="space-y-4">
              {myLendingOffers.map((offer) => (
                <div key={offer.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {user?.currencySymbol}{offer.amount.toFixed(2)} Lending Offer
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Created {formatDistanceToNow(new Date(offer.created_at))} ago
                      </p>
                      {canBeMatched(offer) && offer.status === 'pending' && (
                        <div className="flex items-center gap-2 mt-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Ready for admin matching</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        offer.status === 'pending' ? 'secondary' :
                        offer.status === 'active' ? 'default' :
                        offer.status === 'matched' ? 'default' : 'secondary'
                      }>
                        {offer.status}
                      </Badge>
                      {!canBeMatched(offer) && offer.status === 'pending' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(
                            new Date(offer.created_at).getTime() + (72 * 60 * 60 * 1000)
                          )} until matching available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Active Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Lending Matches
          </CardTitle>
          <CardDescription>
            Your active lending matches. Make a fresh deposit to enable withdrawal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myMatches.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No active matches yet. Wait for admin to match your offers.
            </p>
          ) : (
            <div className="space-y-4">
              {myMatches.map((match) => (
                <div key={match.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {user?.currencySymbol}{match.amount.toFixed(2)} Match
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Started {formatDistanceToNow(new Date(match.created_at))} ago
                      </p>
                      {match.lending_end_time && (
                        <p className="text-sm text-muted-foreground">
                          Ends {formatDistanceToNow(new Date(match.lending_end_time))} from now
                        </p>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant={match.status === 'active' ? 'default' : 'secondary'}>
                        {match.status}
                      </Badge>
                      
                      {match.status === 'active' && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Fresh deposit amount"
                              value={freshDepositAmount}
                              onChange={(e) => setFreshDepositAmount(e.target.value)}
                              className="w-40 text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleFreshDeposit(match.id)}
                              disabled={!freshDepositAmount}
                            >
                              Deposit
                            </Button>
                          </div>
                          
                          {canWithdraw(match) && (
                            <Button
                              onClick={() => handleWithdraw(match.id, match.amount)}
                              className="w-full"
                              variant="default"
                            >
                              Withdraw {user?.currencySymbol}{(match.amount * 2).toFixed(2)}
                              <span className="text-xs ml-1">(100% profit)</span>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
