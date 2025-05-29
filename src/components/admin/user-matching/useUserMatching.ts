
import { useState, useEffect } from 'react';
import { fetchAvailableUsers } from '@/services/admin';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface ApiResponse {
  success: boolean;
  message?: string;
}

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
      const eligibleUsers = data.filter(user => user.wallet_balance > 0);
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
        .rpc('create_p2p_match', {
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
        const eligibleUsers = updatedData.filter(user => user.wallet_balance > 0);
        setUsers(eligibleUsers);
        
        // Reset form
        resetSelection();
        
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
