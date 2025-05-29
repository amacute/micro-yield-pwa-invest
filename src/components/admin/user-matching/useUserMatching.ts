
import { useState, useEffect } from 'react';
import { fetchAvailableUsers } from '@/services/user-management';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

export function useUserMatching() {
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
      const eligibleUsers = data.filter(user => (user.wallet_balance || 0) > 0);
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
    
    if (selectedLender.id === selectedBorrower.id) {
      toast.error('Lender and borrower cannot be the same user');
      return;
    }
    
    if (loanAmount <= 0) {
      toast.error('Loan amount must be greater than 0');
      return;
    }
    
    if (loanAmount > (selectedLender.wallet_balance || 0)) {
      toast.error('Lender has insufficient funds');
      return;
    }
    
    try {
      setProcessing(true);
      
      // Create a transaction record for the P2P lending
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: selectedLender.id,
          amount: loanAmount,
          type: 'p2p_lending',
          status: 'completed',
          description: `P2P loan to ${selectedBorrower.full_name || selectedBorrower.email}: ${loanPurpose || 'P2P Loan'}`
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create corresponding transaction for borrower
      const { error: borrowerTxError } = await supabase
        .from('transactions')
        .insert({
          user_id: selectedBorrower.id,
          amount: loanAmount,
          type: 'p2p_received',
          status: 'completed',
          description: `P2P loan received from ${selectedLender.full_name || selectedLender.email}: ${loanPurpose || 'P2P Loan'}`
        });
      
      if (borrowerTxError) throw borrowerTxError;
      
      // Update wallet balances
      const { error: lenderError } = await supabase
        .from('profiles')
        .update({ 
          wallet_balance: (selectedLender.wallet_balance || 0) - loanAmount 
        })
        .eq('id', selectedLender.id);
      
      if (lenderError) throw lenderError;
      
      const { error: borrowerError } = await supabase
        .from('profiles')
        .update({ 
          wallet_balance: (selectedBorrower.wallet_balance || 0) + loanAmount 
        })
        .eq('id', selectedBorrower.id);
      
      if (borrowerError) throw borrowerError;
      
      // Refresh users data
      const updatedData = await fetchAvailableUsers();
      const eligibleUsers = updatedData.filter(user => (user.wallet_balance || 0) > 0);
      setUsers(eligibleUsers);
      
      // Reset form
      resetSelection();
      
      toast.success(`Successfully matched ${selectedLender.full_name || selectedLender.email} to lend $${loanAmount} to ${selectedBorrower.full_name || selectedBorrower.email}. 100% profit (${loanAmount * 2}) will be credited after 72 hours.`);
      
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

  return {
    users,
    loading,
    selectedLender,
    selectedBorrower,
    loanAmount,
    loanPurpose,
    processing,
    setSelectedLender,
    setSelectedBorrower,
    setLoanAmount,
    setLoanPurpose,
    handleCreateMatch,
    resetSelection
  };
}
