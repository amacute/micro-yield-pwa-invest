
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

// P2P Matching functions
export const fetchPendingLoans = async () => {
  const { data, error } = await supabase
    .from('p2p_loans')
    .select(`
      *,
      users!inner(name, email)
    `)
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
    .from('users')
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

// Create P2P match - simplified for P2P payments
export const createP2PMatch = async (loanId: string, investors: { id: string, amount: number }[]) => {
  try {
    // Create P2P payments for each investor
    const payments = investors.map(investor => ({
      payer_id: investor.id,
      payee_id: loanId, // Using loanId as the payee for now
      amount: investor.amount,
      purpose: 'P2P Investment',
      status: 'completed'
    }));

    const { data, error } = await supabase
      .from('p2p_payments')
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

// Create P2P payment directly using correct column names
export const createLendingMatch = async (lenderId: string, borrowerId: string, amount: number, purpose?: string) => {
  try {
    const { data, error } = await supabase
      .from('p2p_payments')
      .insert({
        payer_id: lenderId,
        payee_id: borrowerId,
        amount: amount,
        purpose: purpose || 'P2P Loan',
        status: 'completed'
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
    .from('p2p_payments')
    .select(`
      *,
      lender:users!p2p_payments_payer_id_fkey(name, email),
      borrower:users!p2p_payments_payee_id_fkey(name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching lending matches:', error);
    toast.error('Failed to load lending matches');
    return [];
  }
  
  return data || [];
};
