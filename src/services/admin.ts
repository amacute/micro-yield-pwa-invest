
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

// User management
export const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching users:', error);
    toast.error('Failed to load users');
    return [];
  }
  
  return data || [];
};

// P2P User Matching - Updated to work with real users who have made deposits
export const fetchAvailableUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .gt('wallet_balance', 0)
    .order('wallet_balance', { ascending: false });
  
  if (error) {
    console.error('Error fetching available users:', error);
    toast.error('Failed to load users');
    return [];
  }
  
  return data || [];
};

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

// Create P2P match - simplified without RPC
export const createP2PMatch = async (loanId: string, investors: { id: string, amount: number }[]) => {
  try {
    // Create matches directly in the p2p_matches table
    const matches = investors.map(investor => ({
      loan_id: loanId,
      investor_id: investor.id,
      amount: investor.amount,
      status: 'active'
    }));

    const { data, error } = await supabase
      .from('p2p_matches')
      .insert(matches)
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

// Create P2P payment directly
export const createLendingMatch = async (lenderId: string, borrowerId: string, amount: number, purpose?: string) => {
  try {
    const { data, error } = await supabase
      .from('p2p_payments')
      .insert({
        payer_user_id: lenderId,
        payee_user_id: borrowerId,
        payment_amount: amount,
        payment_purpose: purpose || 'P2P Loan',
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
      .eq('user_id', userId)
      .single();
    
    if (userFetchError) throw userFetchError;
    
    // Update user wallet balance
    const newBalance = (userData?.wallet_balance || 0) + amount;
    const { error: walletError } = await supabase
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('user_id', userId);
    
    if (walletError) throw walletError;
    
    toast.success('Deposit approved successfully');
    return true;
  } catch (error) {
    console.error('Error approving deposit:', error);
    toast.error('Failed to approve deposit');
    return false;
  }
};

// Lending matches management
export const fetchLendingMatches = async () => {
  const { data, error } = await supabase
    .from('p2p_payments')
    .select(`
      *,
      lender:users!p2p_payments_payer_user_id_fkey(name, email),
      borrower:users!p2p_payments_payee_user_id_fkey(name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching lending matches:', error);
    toast.error('Failed to load lending matches');
    return [];
  }
  
  return data || [];
};

// Analytics
export const fetchAnalyticsData = async () => {
  try {
    // User stats
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    const { count: verifiedUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('kyc_verified', true);
    
    const { count: usersWithBalance } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('wallet_balance', 0);
    
    // Investment stats
    const { count: totalInvestments } = await supabase
      .from('investments')
      .select('*', { count: 'exact', head: true });
    
    const { data: investmentSum } = await supabase
      .from('user_investments')
      .select('amount');
    
    const totalInvestmentAmount = investmentSum?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
    
    // P2P stats
    const { count: totalMatches } = await supabase
      .from('p2p_payments')
      .select('*', { count: 'exact', head: true });
    
    const { data: p2pVolume } = await supabase
      .from('p2p_payments')
      .select('payment_amount');
    
    const totalP2PVolume = p2pVolume?.reduce((sum, payment) => sum + (payment.payment_amount || 0), 0) || 0;
    
    return {
      userStats: {
        total: totalUsers || 0,
        verified: verifiedUsers || 0,
        withDeposits: usersWithBalance || 0
      },
      depositStats: {
        total: totalInvestments || 0,
        approved: totalInvestmentAmount
      },
      lendingStats: {
        totalMatches: totalMatches || 0,
        volume: totalP2PVolume
      }
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    toast.error('Failed to load analytics data');
    
    return {
      userStats: { total: 0, verified: 0, withDeposits: 0 },
      depositStats: { total: 0, approved: 0 },
      lendingStats: { totalMatches: 0, volume: 0 }
    };
  }
};
