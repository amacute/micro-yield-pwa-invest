
import { useState, useEffect } from 'react';
import { fetchAvailableUsers, createUserMatch } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, ArrowRight, DollarSign } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export function UserMatching() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayer, setSelectedPayer] = useState<any>(null);
  const [selectedPayee, setSelectedPayee] = useState<any>(null);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferPurpose, setTransferPurpose] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  
  useEffect(() => {
    const loadUsers = async () => {
      const data = await fetchAvailableUsers();
      setUsers(data);
      setLoading(false);
    };
    
    loadUsers();
  }, []);
  
  const handleCreateMatch = async () => {
    if (!selectedPayer || !selectedPayee) {
      toast.error('Please select both payer and payee');
      return;
    }
    
    if (selectedPayer.user_id === selectedPayee.user_id) {
      toast.error('Payer and payee cannot be the same user');
      return;
    }
    
    if (transferAmount <= 0) {
      toast.error('Transfer amount must be greater than 0');
      return;
    }
    
    if (transferAmount > selectedPayer.wallet_balance) {
      toast.error('Payer has insufficient funds');
      return;
    }
    
    try {
      setProcessing(true);
      
      const result = await createUserMatch(
        selectedPayer.user_id,
        selectedPayee.user_id,
        transferAmount,
        transferPurpose || 'Admin P2P Payment'
      );
      
      if (result.success) {
        // Refresh users data
        const data = await fetchAvailableUsers();
        setUsers(data);
        
        // Reset form
        setSelectedPayer(null);
        setSelectedPayee(null);
        setTransferAmount(0);
        setTransferPurpose('');
        
        toast.success(`Successfully matched ${selectedPayer.name || selectedPayer.email} to pay $${transferAmount} to ${selectedPayee.name || selectedPayee.email}`);
      }
    } catch (error) {
      console.error('Error creating user match:', error);
      toast.error('Failed to create user match');
    } finally {
      setProcessing(false);
    }
  };
  
  const resetSelection = () => {
    setSelectedPayer(null);
    setSelectedPayee(null);
    setTransferAmount(0);
    setTransferPurpose('');
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
          User Payment Matching
        </h2>
        {(selectedPayer || selectedPayee) && (
          <Button variant="outline" onClick={resetSelection}>
            Reset Selection
          </Button>
        )}
      </div>
      
      {/* Match Summary */}
      {(selectedPayer || selectedPayee) && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Payment Match Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-medium">Payer</h4>
                {selectedPayer ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{selectedPayer.name || selectedPayer.email}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Balance: ${Number(selectedPayer.wallet_balance).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No payer selected</p>
                )}
              </div>
              
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              
              <div className="flex-1 text-right">
                <h4 className="font-medium">Payee</h4>
                {selectedPayee ? (
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      Balance: ${Number(selectedPayee.wallet_balance).toFixed(2)}
                    </span>
                    <Badge variant="outline">{selectedPayee.name || selectedPayee.email}</Badge>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No payee selected</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Transfer Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={transferAmount || ''}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Purpose (Optional)</label>
                <Input
                  placeholder="e.g., Investment payout"
                  value={transferPurpose}
                  onChange={(e) => setTransferPurpose(e.target.value)}
                />
              </div>
            </div>
            
            <Button 
              className="w-full mt-4"
              onClick={handleCreateMatch}
              disabled={!selectedPayer || !selectedPayee || transferAmount <= 0 || processing}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <DollarSign className="h-4 w-4 mr-2" />
              )}
              {processing ? 'Processing...' : 'Create Payment Match'}
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
              selectedPayer?.user_id === user.user_id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' :
              selectedPayee?.user_id === user.user_id ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950' :
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
              
              <div className="flex justify-between items-center">
                <Badge variant={user.kyc_verified ? "default" : "secondary"}>
                  {user.kyc_verified ? "Verified" : "Pending"}
                </Badge>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedPayer?.user_id === user.user_id ? "default" : "outline"}
                    onClick={() => setSelectedPayer(selectedPayer?.user_id === user.user_id ? null : user)}
                    disabled={selectedPayee?.user_id === user.user_id}
                  >
                    Payer
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedPayee?.user_id === user.user_id ? "default" : "outline"}
                    onClick={() => setSelectedPayee(selectedPayee?.user_id === user.user_id ? null : user)}
                    disabled={selectedPayer?.user_id === user.user_id}
                  >
                    Payee
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">No users found</p>
        </div>
      )}
    </div>
  );
}
