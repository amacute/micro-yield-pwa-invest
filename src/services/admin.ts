
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
    const totalUsersResult = await supabase.from('users').select('count').single();
    const verifiedUsersResult = await supabase.from('users').select('count').eq('kyc_verified', true).single();
    
    // Investment stats
    const totalInvestmentsResult = await supabase.from('investments').select('count').single();
    const totalRaisedResult = await supabase.from('investments').select('sum(raised)').single();
    
    // P2P stats
    const totalLoansResult = await supabase.from('p2p_loans').select('count').single();
    const totalFundedLoansResult = await supabase.from('p2p_loans').select('sum(amount)').eq('status', 'funded').single();
    
    return {
      userStats: {
        total: totalUsersResult.data?.count || 0,
        verified: verifiedUsersResult.data?.count || 0
      },
      investmentStats: {
        total: totalInvestmentsResult.data?.count || 0,
        raised: totalRaisedResult.data?.sum || 0
      },
      loanStats: {
        total: totalLoansResult.data?.count || 0,
        funded: totalFundedLoansResult.data?.sum || 0
      }
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    toast.error('Failed to load analytics data');
    
    // Return default values in case of error
    return {
      userStats: { total: 0, verified: 0 },
      investmentStats: { total: 0, raised: 0 },
      loanStats: { total: 0, funded: 0 }
    };
  }
};
