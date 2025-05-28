import { useState, useEffect } from 'react';
import { fetchAvailableUsers } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, ArrowRight, DollarSign, Clock } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface ApiResponse {
  success: boolean;
  message?: string;
}

export function UserMatching() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLender, setSelectedLender] = useState<any>(null);
  const [selectedBorrower, setSelectedBorrower] = useState<any>(null);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [loanPurpose, setLoanPurpose] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  
  useEffect(() => {
    const loadUsers = async () => {
      const data = await fetchAvailableUsers();
      // Filter users who have made deposits
      const eligibleUsers = data.filter(user => user.last_deposit_time !== null);
      setUsers(eligibleUsers);
      setLoading(false);
    };
    
    loadUsers();
  }, []);
  
  const handleCreateMatch = async () => {
    if (!selectedLender || !selectedBorrower) {
      toast.error('Please select both lender and borrower');
      return;
    }
    
    if (selectedLender.user_id === selectedBorrower.user_id) {
      toast.error('Lender and borrower cannot be the same user');
      return;
    }
    
    if (loanAmount <= 0) {
      toast.error('Loan amount must be greater than 0');
      return;
    }
    
    if (loanAmount > selectedLender.wallet_balance) {
      toast.error('Lender has insufficient funds');
      return;
    }
    
    try {
      setProcessing(true);
      
      const { data, error } = await supabase
        .rpc('create_lending_match', {
          p_lender_id: selectedLender.user_id,
          p_borrower_id: selectedBorrower.user_id,
          p_amount: loanAmount,
          p_purpose: loanPurpose || 'P2P Loan'
        });
      
      if (error) throw error;
      
      const apiResult = data as ApiResponse;
      
      if (apiResult && apiResult.success) {
        // Refresh users data
        const updatedData = await fetchAvailableUsers();
        const eligibleUsers = updatedData.filter(user => user.last_deposit_time !== null);
        setUsers(eligibleUsers);
        
        // Reset form
        setSelectedLender(null);
        setSelectedBorrower(null);
        setLoanAmount(0);
        setLoanPurpose('');
        
        toast.success(`Successfully matched ${selectedLender.name || selectedLender.email} to lend $${loanAmount} to ${selectedBorrower.name || selectedBorrower.email}. 100% profit (${loanAmount * 2}) will be credited after 72 hours.`);
      }
    } catch (error) {
      console.error('Error creating P2P lending match:', error);
      toast.error('Failed to create P2P lending match');
    } finally {
      setProcessing(false);
    }
  };
  
  const resetSelection = () => {
    setSelectedLender(null);
    setSelectedBorrower(null);
    setLoanAmount(0);
    setLoanPurpose('');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          P2P Lending Matching
        </h2>
        {(selectedLender || selectedBorrower) && (
          <Button variant="outline" onClick={resetSelection}>
            Reset Selection
          </Button>
        )}
      </div>
      
      {/* Match Summary */}
      {(selectedLender || selectedBorrower) && (
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
                    <Badge variant="outline">{selectedLender.name || selectedLender.email}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Available: ${Number(selectedLender.wallet_balance).toFixed(2)}
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
                      Balance: ${Number(selectedBorrower.wallet_balance).toFixed(2)}
                    </span>
                    <Badge variant="outline">{selectedBorrower.name || selectedBorrower.email}</Badge>
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
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Purpose</label>
                <Input
                  placeholder="e.g., Business loan, Education"
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
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
              onClick={handleCreateMatch}
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
      )}
      
      {/* User Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <Card 
            key={user.id} 
            className={`cursor-pointer transition-all ${
              selectedLender?.user_id === user.user_id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' :
              selectedBorrower?.user_id === user.user_id ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950' :
              'hover:shadow-md'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium">{user.name || "Unnamed User"}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.phone && (
                    <p className="text-xs text-muted-foreground">{user.phone}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">${Number(user.wallet_balance).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Balance</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <Badge variant={user.kyc_verified ? "default" : "secondary"}>
                  {user.kyc_verified ? "Verified" : "Pending"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Deposit Made
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={selectedLender?.user_id === user.user_id ? "default" : "outline"}
                  onClick={() => setSelectedLender(selectedLender?.user_id === user.user_id ? null : user)}
                  disabled={selectedBorrower?.user_id === user.user_id}
                  className="flex-1"
                >
                  Lender
                </Button>
                <Button
                  size="sm"
                  variant={selectedBorrower?.user_id === user.user_id ? "default" : "outline"}
                  onClick={() => setSelectedBorrower(selectedBorrower?.user_id === user.user_id ? null : user)}
                  disabled={selectedLender?.user_id === user.user_id}
                  className="flex-1"
                >
                  Borrower
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">No eligible users found. Users must make a deposit before participating in P2P lending.</p>
        </div>
      )}
    </div>
  );
}
