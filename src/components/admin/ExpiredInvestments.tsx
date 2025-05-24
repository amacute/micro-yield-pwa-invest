
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Clock, Users, DollarSign } from 'lucide-react';

export function ExpiredInvestments() {
  const [expiredInvestments, setExpiredInvestments] = useState<any[]>([]);
  const [availableInvestors, setAvailableInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpiredInvestments();
    fetchAvailableInvestors();
  }, []);

  const fetchExpiredInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_investments')
        .select(`
          *,
          users(name, email, currency_symbol)
        `)
        .eq('status', 'expired')
        .order('end_date', { ascending: true });
      
      if (error) throw error;
      setExpiredInvestments(data || []);
    } catch (error) {
      console.error('Error fetching expired investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableInvestors = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .gte('wallet_balance', 10)
        .eq('is_blocked', false)
        .order('wallet_balance', { ascending: false });
      
      if (error) throw error;
      setAvailableInvestors(data || []);
    } catch (error) {
      console.error('Error fetching available investors:', error);
    }
  };

  const matchInvestment = async (investmentId: string, payerId: string) => {
    try {
      const { error } = await supabase
        .from('payment_matches')
        .insert({
          investment_id: investmentId,
          payer_id: payerId,
          status: 'matched'
        });
      
      if (error) throw error;
      
      // Update investment status
      await supabase
        .from('user_investments')
        .update({ status: 'matched' })
        .eq('id', investmentId);
      
      toast.success('Investment matched successfully');
      fetchExpiredInvestments();
    } catch (error) {
      console.error('Error matching investment:', error);
      toast.error('Failed to match investment');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading expired investments...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Expired Investments Awaiting Payout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expiredInvestments.map(investment => (
              <div key={investment.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">{investment.users.name}</h3>
                    <p className="text-sm text-muted-foreground">{investment.users.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm">
                        Investment: {investment.users.currency_symbol}{investment.amount.toFixed(2)}
                      </span>
                      <span className="text-sm text-green-600">
                        Payout: {investment.users.currency_symbol}{investment.expected_return.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Expired: {new Date(investment.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="destructive">Expired</Badge>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Available Payers:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availableInvestors
                      .filter(investor => investor.wallet_balance >= investment.expected_return)
                      .slice(0, 3)
                      .map(investor => (
                        <div key={investor.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <p className="text-sm font-medium">{investor.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Balance: {investor.currency_symbol}{investor.wallet_balance.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => matchInvestment(investment.id, investor.id)}
                          >
                            Match
                          </Button>
                        </div>
                      ))}
                  </div>
                  
                  {availableInvestors.filter(i => i.wallet_balance >= investment.expected_return).length === 0 && (
                    <p className="text-sm text-muted-foreground">No suitable payers available</p>
                  )}
                </div>
              </div>
            ))}
            
            {expiredInvestments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No expired investments awaiting payout
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Investors ({availableInvestors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableInvestors.slice(0, 9).map(investor => (
              <div key={investor.id} className="p-3 border rounded-lg">
                <h4 className="font-medium">{investor.name}</h4>
                <p className="text-sm text-muted-foreground">{investor.email}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-green-600">
                    {investor.currency_symbol}{investor.wallet_balance.toFixed(2)}
                  </span>
                  <Badge variant="outline">Available</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
