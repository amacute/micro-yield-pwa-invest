import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface MakeDepositProps {
  investmentId: string;
  requiredAmount: number;
  type: 'initial' | 'withdrawal';
  onSuccess: () => void;
}

export function MakeDeposit({
  investmentId,
  requiredAmount,
  type,
  onSuccess
}: MakeDepositProps) {
  const [amount, setAmount] = useState<number>(requiredAmount);
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (amount !== requiredAmount) {
      toast.error(`Deposit amount must be exactly $${requiredAmount}`);
      return;
    }

    setLoading(true);
    try {
      // Create deposit record
      const { data: deposit, error: depositError } = await supabase
        .from('deposits')
        .insert([
          {
            investment_id: investmentId,
            amount,
            type
          }
        ])
        .select()
        .single();

      if (depositError) throw depositError;

      // Process the deposit
      const { error: processError } = await supabase.rpc('process_deposit', {
        p_deposit_id: deposit.id
      });

      if (processError) throw processError;

      toast.success('Deposit processed successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error processing deposit:', error);
      toast.error('Failed to process deposit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {type === 'initial' ? 'Initial Deposit' : 'Withdrawal Deposit'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Required Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground">
            {type === 'initial'
              ? 'Please make your initial deposit to confirm your investment.'
              : 'To withdraw your investment and profit, you must first make an additional deposit equal to your initial investment amount.'}
          </p>
        </div>

        <Button
          onClick={handleDeposit}
          disabled={loading || amount !== requiredAmount}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Make ${type === 'initial' ? 'Initial' : 'Withdrawal'} Deposit`
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 