
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, DollarSign } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface ExpiredInvestment {
  id: string;
  investor_id: string;
  investor_name: string;
  amount: number;
  expired_date: string;
  status: 'pending_match' | 'matched' | 'paid';
}

interface PaymentMatch {
  id: string;
  investment_id: string;
  payer_id: string;
  payer_name: string;
  matched_date: string;
}

export function ExpiredInvestments() {
  const [expiredInvestments, setExpiredInvestments] = useState<ExpiredInvestment[]>([]);
  const [availablePayers, setAvailablePayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExpiredInvestments();
    loadAvailablePayers();
  }, []);

  const loadExpiredInvestments = () => {
    // Mock data for expired investments
    const mockData: ExpiredInvestment[] = [
      {
        id: '1',
        investor_id: 'user1',
        investor_name: 'John Doe',
        amount: 1000,
        expired_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending_match'
      },
      {
        id: '2',
        investor_id: 'user2',
        investor_name: 'Jane Smith',
        amount: 2500,
        expired_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        status: 'pending_match'
      }
    ];
    setExpiredInvestments(mockData);
  };

  const loadAvailablePayers = () => {
    // Mock data for available payers
    const mockPayers = [
      { id: 'payer1', name: 'Alice Johnson', available_amount: 5000 },
      { id: 'payer2', name: 'Bob Wilson', available_amount: 3000 },
      { id: 'payer3', name: 'Carol Davis', available_amount: 7500 }
    ];
    setAvailablePayers(mockPayers);
  };

  const handleMatch = async (investmentId: string, payerId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const investment = expiredInvestments.find(inv => inv.id === investmentId);
      const payer = availablePayers.find(p => p.id === payerId);

      if (!investment || !payer) {
        throw new Error('Investment or payer not found');
      }

      // Create mock payment match
      const paymentMatch: PaymentMatch = {
        id: `match_${Date.now()}`,
        investment_id: investmentId,
        payer_id: payerId,
        payer_name: payer.name,
        matched_date: new Date().toISOString()
      };

      // Update investment status
      setExpiredInvestments(prev => 
        prev.map(inv => 
          inv.id === investmentId 
            ? { ...inv, status: 'matched' }
            : inv
        )
      );

      toast.success(`Successfully matched ${investment.investor_name} with ${payer.name}`);
    } catch (error) {
      console.error('Error creating match:', error);
      toast.error('Failed to create payment match');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Expired Investments Awaiting Payment Matching
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expiredInvestments.filter(inv => inv.status === 'pending_match').map((investment) => (
              <div key={investment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{investment.investor_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Expired: {formatDate(investment.expired_date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatCurrency(investment.amount)}</div>
                    <Badge variant="destructive">Expired</Badge>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Available Payers:</h4>
                  <div className="grid gap-2">
                    {availablePayers
                      .filter(payer => payer.available_amount >= investment.amount)
                      .map((payer) => (
                        <div key={payer.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <span className="font-medium">{payer.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              Available: {formatCurrency(payer.available_amount)}
                            </span>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleMatch(investment.id, payer.id)}
                            disabled={loading}
                          >
                            Match
                          </Button>
                        </div>
                      ))}
                  </div>
                  {availablePayers.filter(payer => payer.available_amount >= investment.amount).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No available payers with sufficient funds
                    </p>
                  )}
                </div>
              </div>
            ))}

            {expiredInvestments.filter(inv => inv.status === 'pending_match').length === 0 && (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Expired Investments</h3>
                <p className="text-muted-foreground">All investments are currently active or have been matched.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Matched Investments */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Matched</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expiredInvestments
              .filter(inv => inv.status === 'matched')
              .map((investment) => (
                <div key={investment.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <span className="font-medium">{investment.investor_name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {formatCurrency(investment.amount)}
                      </span>
                    </div>
                  </div>
                  <Badge variant="default">Matched</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
