
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

// Investment Management
export const fetchInvestments = async () => {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching investments:', error);
    toast.error('Failed to load investments');
    return [];
  }
  
  return data || [];
};

export const createInvestment = async (investmentData: any) => {
  const { data, error } = await supabase
    .from('investments')
    .insert(investmentData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating investment:', error);
    toast.error('Failed to create investment');
    return null;
  }
  
  toast.success('Investment created successfully');
  return data;
};

// Deposit management
export const fetchDeposits = async () => {
  const { data, error } = await supabase
    .from('user_investments')
    .select(`
      *,
      users!inner(name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching deposits:', error);
    toast.error('Failed to load deposits');
    return [];
  }
  
  return data || [];
};

// Simple deposit approval
export const approveDeposit = async (depositId: string, amount: number, userId: string) => {
  try {
    // Update the deposit status
    const { error: depositError } = await supabase
      .from('user_investments')
      .update({ status: 'approved' })
      .eq('id', depositId);
    
    if (depositError) throw depositError;
    
    // Get current user balance
    const { data: userData, error: userFetchError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
    
    if (userFetchError) throw userFetchError;
    
    // Update user wallet balance
    const newBalance = (userData?.wallet_balance || 0) + amount;
    const { error: walletError } = await supabase
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);
    
    if (walletError) throw walletError;
    
    toast.success('Deposit approved successfully');
    return true;
  } catch (error) {
    console.error('Error approving deposit:', error);
    toast.error('Failed to approve deposit');
    return false;
  }
};
