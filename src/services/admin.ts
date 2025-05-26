
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

// Investment management
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

export const createInvestment = async (investment: any) => {
  const { data, error } = await supabase
    .from('investments')
    .insert([investment])
    .select();
  
  if (error) {
    console.error('Error creating investment:', error);
    toast.error('Failed to create investment');
    return null;
  }
  
  toast.success('Investment created successfully');
  return data?.[0] || null;
};

// P2P User Matching - Updated to work with real users
export const fetchAvailableUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('wallet_balance', { ascending: false });
  
  if (error) {
    console.error('Error fetching available users:', error);
    toast.error('Failed to load users');
    return [];
  }
  
  return data || [];
};

// Create P2P payment using the database function
export const createUserMatch = async (payerId: string, payeeId: string, amount: number, purpose?: string) => {
  const { data, error } = await supabase
    .rpc('create_p2p_payment', {
      payer_user_id: payerId,
      payee_user_id: payeeId,
      payment_amount: amount,
      payment_purpose: purpose
    });
  
  if (error) {
    console.error('Error creating user match:', error);
    toast.error('Failed to create payment match');
    return { success: false, message: error.message };
  }
  
  toast.success('Payment match created successfully');
  return data;
};

// P2P Loans
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
    .eq('kyc_verified', true)
    .gt('wallet_balance', 0)
    .order('wallet_balance', { ascending: false });
  
  if (error) {
    console.error('Error fetching available investors:', error);
    toast.error('Failed to load available investors');
    return [];
  }
  
  return data || [];
};

export const createP2PMatch = async (loanId: string, investorMatches: { id: string, amount: number }[]) => {
  const investorIds = investorMatches.map(match => match.id);
  const amounts = investorMatches.map(match => match.amount);
  
  const { data, error } = await supabase
    .rpc('create_p2p_match', {
      loan_id: loanId,
      investor_ids: investorIds,
      amounts: amounts
    });
  
  if (error) {
    console.error('Error creating P2P match:', error);
    toast.error('Failed to create P2P match');
    return { success: false, message: error.message };
  }
  
  toast.success('P2P match created successfully');
  return { success: true, ...(data as Record<string, unknown>) };
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
    
    // Investment stats
    const { count: totalInvestments } = await supabase
      .from('investments')
      .select('*', { count: 'exact', head: true });
    
    const { data: investmentSum } = await supabase
      .from('investments')
      .select('raised');
    
    const totalRaised = investmentSum?.reduce((sum, inv) => sum + (inv.raised || 0), 0) || 0;
    
    // P2P stats
    const { count: totalLoans } = await supabase
      .from('p2p_loans')
      .select('*', { count: 'exact', head: true });
    
    const { data: fundedLoans } = await supabase
      .from('p2p_loans')
      .select('amount')
      .eq('status', 'funded');
    
    const totalFunded = fundedLoans?.reduce((sum, loan) => sum + (loan.amount || 0), 0) || 0;
    
    return {
      userStats: {
        total: totalUsers || 0,
        verified: verifiedUsers || 0
      },
      investmentStats: {
        total: totalInvestments || 0,
        raised: totalRaised
      },
      loanStats: {
        total: totalLoans || 0,
        funded: totalFunded
      }
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    toast.error('Failed to load analytics data');
    
    return {
      userStats: { total: 0, verified: 0 },
      investmentStats: { total: 0, raised: 0 },
      loanStats: { total: 0, funded: 0 }
    };
  }
};
