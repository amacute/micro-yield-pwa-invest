
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

// P2P Matching functions - using transactions table instead of p2p_loans
export const fetchPendingLoans = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      profiles!inner(full_name, email)
    `)
    .eq('type', 'loan_request')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching pending loans:', error);
    toast.error('Failed to load pending loans');
    return [];
  }
  
  return data || [];
};

export const fetchAvailableInvestors = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .gt('wallet_balance', 0)
    .order('wallet_balance', { ascending: false });
  
  if (error) {
    console.error('Error fetching available investors:', error);
    toast.error('Failed to load investors');
    return [];
  }
  
  return data || [];
};

// Create P2P match - using transactions table instead of p2p_payments
export const createP2PMatch = async (loanId: string, investors: { id: string, amount: number }[]) => {
  try {
    // Create P2P payments for each investor using transactions table
    const payments = investors.map(investor => ({
      user_id: investor.id,
      amount: investor.amount,
      type: 'p2p_investment',
      status: 'completed',
      description: `P2P Investment for loan ${loanId}`
    }));

    const { data, error } = await supabase
      .from('transactions')
      .insert(payments)
      .select();
    
    if (error) throw error;
    
    toast.success('P2P match created successfully');
    return { success: true, data };
  } catch (error) {
    console.error('Error creating P2P match:', error);
    toast.error('Failed to create P2P match');
    return { success: false, error };
  }
};

// Create P2P payment directly using transactions table
export const createLendingMatch = async (lenderId: string, borrowerId: string, amount: number, purpose?: string) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: lenderId,
        amount: amount,
        type: 'p2p_lending',
        status: 'completed',
        description: purpose || 'P2P Loan'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Lending match created successfully');
    return { success: true, data };
  } catch (error) {
    console.error('Error creating lending match:', error);
    toast.error('Failed to create lending match');
    return { success: false, error };
  }
};

// Lending matches management
export const fetchLendingMatches = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      profiles!inner(full_name, email)
    `)
    .eq('type', 'p2p_lending')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching lending matches:', error);
    toast.error('Failed to load lending matches');
    return [];
  }
  
  return data || [];
};
