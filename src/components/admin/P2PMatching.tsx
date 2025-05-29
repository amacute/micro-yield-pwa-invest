
import { useState, useEffect } from 'react';
import { fetchPendingLoans, fetchAvailableInvestors, createP2PMatch } from '@/services/p2p-matching';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export function P2PMatching() {
  const [pendingLoans, setPendingLoans] = useState<any[]>([]);
  const [availableInvestors, setAvailableInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [selectedInvestors, setSelectedInvestors] = useState<Record<string, { id: string, amount: number }>>({});
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loans, investors] = await Promise.all([
          fetchPendingLoans(),
          fetchAvailableInvestors()
        ]);
        
        setPendingLoans(loans);
        setAvailableInvestors(investors);
      } catch (error) {
        console.error('Error loading P2P data:', error);
        toast.error('Failed to load P2P matching data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const handleSelectLoan = (loanId: string) => {
    if (selectedLoan === loanId) {
      setSelectedLoan(null);
    } else {
      setSelectedLoan(loanId);
      setSelectedInvestors({});
    }
  };
  
  const toggleInvestor = (investorId: string) => {
    if (selectedInvestors[investorId]) {
      const updatedInvestors = { ...selectedInvestors };
      delete updatedInvestors[investorId];
      setSelectedInvestors(updatedInvestors);
    } else {
      setSelectedInvestors({
        ...selectedInvestors,
        [investorId]: { id: investorId, amount: 0 }
      });
    }
  };
  
  const handleInvestmentAmountChange = (investorId: string, amount: number) => {
    if (amount < 0) return;
    
    setSelectedInvestors(prev => ({
      ...prev,
      [investorId]: { ...prev[investorId], amount }
    }));
  };
  
  const handleCreateMatch = async () => {
    if (!selectedLoan) {
      toast.error('Please select a loan');
      return;
    }
    
    const selectedInvestorsList = Object.values(selectedInvestors);
    
    if (selectedInvestorsList.length === 0) {
      toast.error('Please select at least one investor');
      return;
    }
    
    const totalAmount = selectedInvestorsList.reduce((sum, investor) => sum + investor.amount, 0);
    
    if (totalAmount <= 0) {
      toast.error('Total investment amount must be greater than 0');
      return;
    }
    
    try {
      const result = await createP2PMatch(selectedLoan, selectedInvestorsList);
      
      if (result && result.success) {
        // Refresh the data
        const [loans, investors] = await Promise.all([
          fetchPendingLoans(),
          fetchAvailableInvestors()
        ]);
        
        setPendingLoans(loans);
        setAvailableInvestors(investors);
        setSelectedLoan(null);
        setSelectedInvestors({});
      }
    } catch (error) {
      console.error('Error creating P2P match:', error);
      toast.error('Failed to create P2P match');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  
  const selectedLoanObj = selectedLoan ? pendingLoans.find(loan => loan.id === selectedLoan) : null;
  const totalSelectedAmount = Object.values(selectedInvestors).reduce((sum, investor) => sum + investor.amount, 0);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Available Investors</h3>
          <div className="space-y-4">
            {availableInvestors.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">No available investors found</p>
              </div>
            ) : (
              availableInvestors.map(investor => (
                <div 
                  key={investor.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedInvestors[investor.id] ? 'bg-axiom-primary/10 border-axiom-primary' : ''
                  }`}
                  onClick={() => toggleInvestor(investor.id)}
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium">{investor.name || investor.email}</h3>
                    <span className="text-sm text-muted-foreground">
                      Available: ${investor.wallet_balance.toLocaleString()}
                    </span>
                  </div>
                  
                  {selectedInvestors[investor.id] && (
                    <div className="mt-2 flex items-center gap-2">
                      <Input 
                        type="number"
                        placeholder="Amount to invest" 
                        className="text-sm"
                        min={10}
                        max={investor.wallet_balance}
                        value={selectedInvestors[investor.id].amount || ''}
                        onChange={(e) => handleInvestmentAmountChange(investor.id, Number(e.target.value))}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Demo P2P Matching</h3>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-4">
              This is a demo interface. Select investors and set amounts to simulate P2P matching.
            </p>
            
            {Object.keys(selectedInvestors).length > 0 ? (
              <div className="space-y-2">
                <p className="font-medium">Selected Investors:</p>
                {Object.keys(selectedInvestors).map(id => {
                  const investor = availableInvestors.find(i => i.id === id);
                  const amount = selectedInvestors[id].amount;
                  return (
                    <div key={id} className="text-sm">
                      {investor?.name || investor?.email} - ${amount.toLocaleString()}
                    </div>
                  );
                })}
                <div className="mt-2 pt-2 border-t">
                  <p className="font-medium">Total: ${totalSelectedAmount.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No investors selected</p>
            )}
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full"
        disabled={Object.keys(selectedInvestors).length === 0 || totalSelectedAmount <= 0}
        onClick={handleCreateMatch}
      >
        Create Demo Match
      </Button>
    </div>
  );
}
