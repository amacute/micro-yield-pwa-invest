
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
    .not('last_deposit_time', 'is', null)
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

export const createP2PMatch = async (loanId: string, investors: { id: string, amount: number }[]) => {
  try {
    const { data, error } = await supabase
      .rpc('create_p2p_investment_match', {
        loan_id: loanId,
        investor_ids: investors.map(inv => inv.id),
        amounts: investors.map(inv => inv.amount)
      });
    
    if (error) throw error;
    
    toast.success('P2P match created successfully');
    return { success: true, data };
  } catch (error) {
    console.error('Error creating P2P match:', error);
    toast.error('Failed to create P2P match');
    return { success: false, error };
  }
};

// Create P2P lending match using the database function
export const createLendingMatch = async (lenderId: string, borrowerId: string, amount: number, purpose?: string) => {
  const { data, error } = await supabase
    .rpc('create_lending_match', {
      p_lender_id: lenderId,
      p_borrower_id: borrowerId,
      p_amount: amount,
      p_purpose: purpose
    });
  
  if (error) {
    console.error('Error creating lending match:', error);
    toast.error('Failed to create lending match');
    return { success: false, message: error.message };
  }
  
  toast.success('Lending match created successfully');
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

export const approveDeposit = async (depositId: string, amount: number, userId: string) => {
  const { error } = await supabase
    .rpc('approve_deposit', {
      deposit_id: depositId,
      deposit_amount: amount,
      user_id: userId
    });
  
  if (error) {
    console.error('Error approving deposit:', error);
    toast.error('Failed to approve deposit');
    return false;
  }
  
  toast.success('Deposit approved successfully');
  return true;
};

// Lending matches management
export const fetchLendingMatches = async () => {
  const { data, error } = await supabase
    .from('p2p_payments')
    .select(`
      *,
      lender:users!p2p_payments_from_user_id_fkey(name, email),
      borrower:users!p2p_payments_to_user_id_fkey(name, email)
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
    
    const { count: usersWithDeposits } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('last_deposit_time', 'is', null);
    
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
      .select('amount');
    
    const totalP2PVolume = p2pVolume?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
    
    return {
      userStats: {
        total: totalUsers || 0,
        verified: verifiedUsers || 0,
        withDeposits: usersWithDeposits || 0
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
