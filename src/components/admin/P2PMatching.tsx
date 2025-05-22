
import { useState, useEffect } from 'react';
import { fetchPendingLoans, fetchAvailableInvestors, createP2PMatch } from '@/services/admin';
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
    const selectedLoanObj = pendingLoans.find(loan => loan.id === selectedLoan);
    
    if (totalAmount <= 0) {
      toast.error('Total investment amount must be greater than 0');
      return;
    }
    
    if (totalAmount > selectedLoanObj.amount) {
      toast.error(`Total investment exceeds loan amount of $${selectedLoanObj.amount}`);
      return;
    }
    
    try {
      const result = await createP2PMatch(selectedLoan, selectedInvestorsList);
      
      // Check if the result has the expected structure
      if (result && typeof result === 'object' && 'success' in result && result.success) {
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
          <h3 className="font-medium mb-2">Pending Loans</h3>
          <div className="space-y-4">
            {pendingLoans.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">No pending loans found</p>
              </div>
            ) : (
              pendingLoans.map(loan => (
                <div 
                  key={loan.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedLoan === loan.id ? 'bg-axiom-primary/10 border-axiom-primary' : ''
                  }`}
                  onClick={() => handleSelectLoan(loan.id)}
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium">{loan.users.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      loan.risk === 'Low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      loan.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {loan.risk} Risk
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{loan.purpose}</p>
                  <p className="font-medium mt-2">Amount: ${loan.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    Interest: {loan.interest_rate}% • Term: {loan.term} days
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
        
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
      </div>
      
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-4">Create P2P Connection</h3>
        
        <div className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Match Summary</h4>
            
            {selectedLoanObj ? (
              <p>
                <span className="font-medium">Selected Borrower:</span> {selectedLoanObj.users.name || selectedLoanObj.users.email}
                <br />
                <span className="font-medium">Loan Amount:</span> ${selectedLoanObj.amount.toLocaleString()}
              </p>
            ) : (
              <p className="text-muted-foreground">No borrower selected</p>
            )}
            
            {Object.keys(selectedInvestors).length > 0 ? (
              <div className="mt-2">
                <p className="font-medium">Selected Investors:</p>
                <ul className="list-disc list-inside">
                  {Object.keys(selectedInvestors).map(id => {
                    const investor = availableInvestors.find(i => i.id === id);
                    const amount = selectedInvestors[id].amount;
                    return (
                      <li key={id}>
                        {investor?.name || investor?.email} - ${amount.toLocaleString()}
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-2">
                  <p className="font-medium">Total Investment: ${totalSelectedAmount.toLocaleString()}</p>
                  {selectedLoanObj && totalSelectedAmount > selectedLoanObj.amount && (
                    <p className="text-red-500 flex items-center gap-1 text-sm mt-1">
                      <AlertCircle className="h-4 w-4" />
                      Total exceeds loan amount by ${(totalSelectedAmount - selectedLoanObj.amount).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground mt-2">No investors selected</p>
            )}
          </div>
          
          <Button 
            className="w-full"
            disabled={!selectedLoan || Object.keys(selectedInvestors).length === 0 || totalSelectedAmount <= 0}
            onClick={handleCreateMatch}
          >
            Create P2P Match
          </Button>
        </div>
      </div>
    </div>
  );
}
