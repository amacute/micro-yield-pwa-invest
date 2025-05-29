
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, DollarSign, Loader2 } from 'lucide-react';

interface MatchSummaryCardProps {
  selectedLender: any | null;
  selectedBorrower: any | null;
  loanAmount: number;
  loanPurpose: string;
  processing: boolean;
  onLoanAmountChange: (amount: number) => void;
  onLoanPurposeChange: (purpose: string) => void;
  onCreateMatch: () => void;
}

export function MatchSummaryCard({
  selectedLender,
  selectedBorrower,
  loanAmount,
  loanPurpose,
  processing,
  onLoanAmountChange,
  onLoanPurposeChange,
  onCreateMatch
}: MatchSummaryCardProps) {
  if (!selectedLender && !selectedBorrower) {
    return null;
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg">Lending Match Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h4 className="font-medium">Lender</h4>
            {selectedLender ? (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{selectedLender.full_name || selectedLender.email}</Badge>
                <span className="text-sm text-muted-foreground">
                  Available: ${Number(selectedLender.wallet_balance || 0).toFixed(2)}
                </span>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No lender selected</p>
            )}
          </div>
          
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          
          <div className="flex-1 text-right">
            <h4 className="font-medium">Borrower</h4>
            {selectedBorrower ? (
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  Balance: ${Number(selectedBorrower.wallet_balance || 0).toFixed(2)}
                </span>
                <Badge variant="outline">{selectedBorrower.full_name || selectedBorrower.email}</Badge>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No borrower selected</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium">Loan Amount</label>
            <Input
              type="number"
              placeholder="0.00"
              value={loanAmount || ''}
              onChange={(e) => onLoanAmountChange(Number(e.target.value))}
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Purpose</label>
            <Input
              placeholder="e.g., Business loan, Education"
              value={loanPurpose}
              onChange={(e) => onLoanPurposeChange(e.target.value)}
            />
          </div>
        </div>
        
        {loanAmount > 0 && (
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg mb-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Lender will receive ${(loanAmount * 2).toFixed(2)} (100% profit) after 72 hours
              </span>
            </div>
          </div>
        )}
        
        <Button 
          className="w-full"
          onClick={onCreateMatch}
          disabled={!selectedLender || !selectedBorrower || loanAmount <= 0 || processing}
        >
          {processing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <DollarSign className="h-4 w-4 mr-2" />
          )}
          {processing ? 'Processing...' : 'Create Lending Match'}
        </Button>
      </CardContent>
    </Card>
  );
}
