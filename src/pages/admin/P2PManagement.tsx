
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, DollarSign, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LendingOffer {
  id: string;
  amount: number;
  created_at: string;
  status: string;
  user: {
    name: string;
    email: string;
  };
}

interface DepositRequest {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  lending_offer: {
    amount: number;
  };
}

export default function P2PManagement() {
  const [readyOffers, setReadyOffers] = useState<LendingOffer[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<DepositRequest[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Load offers ready for matching (72+ hours old)
      const { data: offers, error: offersError } = await supabase
        .from('p2p_lending_offers')
        .select(`
          *,
          users!inner(name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (offersError) throw offersError;

      // Filter offers that are 72+ hours old
      const readyOffers = offers?.filter(offer => {
        const createdTime = new Date(offer.created_at);
        const now = new Date();
        const hoursPassed = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60);
        return hoursPassed >= 72;
      }) || [];

      // Load pending fresh deposits
      const { data: deposits, error: depositsError } = await supabase
        .from('p2p_fresh_deposits')
        .select(`
          *,
          users!inner(name, email),
          p2p_lending_offers!inner(amount)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (depositsError) throw depositsError;

      setReadyOffers(readyOffers);
      setPendingDeposits(deposits || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchLenders = async () => {
    if (selectedOffers.length < 2) {
      toast.error('Please select at least 2 lenders to match');
      return;
    }

    try {
      // Create a multi-lender match
      const lenderContributions = selectedOffers.map(offerId => {
        const offer = readyOffers.find(o => o.id === offerId);
        return {
          lender_id: offer?.user_id,
          amount: offer?.amount
        };
      });

      const totalAmount = lenderContributions.reduce((sum, contrib) => sum + (contrib.amount || 0), 0);

      const { data, error } = await supabase
        .rpc('create_multi_lender_match', {
          p_lender_contributions: lenderContributions,
          p_borrower_id: lenderContributions[0].lender_id, // First lender becomes borrower
          p_total_amount: totalAmount,
          p_purpose: 'P2P Multi-Lender Match'
        });

      if (error) throw error;

      // Update lending offers status
      const { error: updateError } = await supabase
        .from('p2p_lending_offers')
        .update({ status: 'matched' })
        .in('id', selectedOffers);

      if (updateError) throw updateError;

      toast.success(`Successfully matched ${selectedOffers.length} lenders!`);
      setSelectedOffers([]);
      loadAdminData();
    } catch (error) {
      console.error('Error matching lenders:', error);
      toast.error('Failed to match lenders');
    }
  };

  const handleApproveDeposit = async (depositId: string, amount: number, lendingOfferId: string) => {
    try {
      // Approve the deposit
      const { error: depositError } = await supabase
        .from('p2p_fresh_deposits')
        .update({ status: 'approved' })
        .eq('id', depositId);

      if (depositError) throw depositError;

      // Enable withdrawal for the lending offer
      const { error: offerError } = await supabase
        .from('p2p_lending_offers')
        .update({ withdrawal_enabled: true })
        .eq('id', lendingOfferId);

      if (offerError) throw offerError;

      toast.success('Deposit approved and withdrawal enabled!');
      loadAdminData();
    } catch (error) {
      console.error('Error approving deposit:', error);
      toast.error('Failed to approve deposit');
    }
  };

  const toggleOfferSelection = (offerId: string) => {
    setSelectedOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
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
        <h1 className="text-3xl font-bold tracking-tight">P2P Management</h1>
        <p className="text-muted-foreground">
          Manage lending offers, match lenders, and approve deposits
        </p>
      </div>

      {/* Ready for Matching */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Ready for Matching ({readyOffers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {readyOffers.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No offers ready for matching yet
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Select 2 or more lenders to create a match
                </p>
                <Button
                  onClick={handleMatchLenders}
                  disabled={selectedOffers.length < 2}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Match Selected ({selectedOffers.length})
                </Button>
              </div>

              {readyOffers.map((offer) => (
                <div 
                  key={offer.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedOffers.includes(offer.id) ? 'bg-blue-50 border-blue-500' : ''
                  }`}
                  onClick={() => toggleOfferSelection(offer.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{offer.user.name || offer.user.email}</h3>
                      <p className="text-sm text-muted-foreground">
                        Amount: ${offer.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ready since {formatDistanceToNow(new Date(offer.created_at))} ago
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Ready</Badge>
                      {selectedOffers.includes(offer.id) && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Deposits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pending Fresh Deposits ({pendingDeposits.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingDeposits.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No pending deposits
            </p>
          ) : (
            <div className="space-y-4">
              {pendingDeposits.map((deposit) => (
                <div key={deposit.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{deposit.user.name || deposit.user.email}</h3>
                      <p className="text-sm text-muted-foreground">
                        Fresh deposit: ${deposit.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Original lending: ${deposit.lending_offer.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submitted {formatDistanceToNow(new Date(deposit.created_at))} ago
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Pending</Badge>
                      <Button
                        onClick={() => handleApproveDeposit(
                          deposit.id, 
                          deposit.amount, 
                          deposit.lending_offer_id
                        )}
                        size="sm"
                      >
                        Approve
                      </Button>
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
