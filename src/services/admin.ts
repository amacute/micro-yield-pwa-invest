
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
    .from('deposits')
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
    .from('lending_matches')
    .select(`
      *,
      lender:users!lending_matches_lender_id_fkey(name, email),
      borrower:users!lending_matches_borrower_id_fkey(name, email)
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
    
    // Deposit stats
    const { count: totalDeposits } = await supabase
      .from('deposits')
      .select('*', { count: 'exact', head: true });
    
    const { data: depositSum } = await supabase
      .from('deposits')
      .select('amount')
      .eq('status', 'approved');
    
    const totalDepositAmount = depositSum?.reduce((sum, dep) => sum + (dep.amount || 0), 0) || 0;
    
    // Lending stats
    const { count: totalMatches } = await supabase
      .from('lending_matches')
      .select('*', { count: 'exact', head: true });
    
    const { data: lendingVolume } = await supabase
      .from('lending_matches')
      .select('amount');
    
    const totalLendingVolume = lendingVolume?.reduce((sum, match) => sum + (match.amount || 0), 0) || 0;
    
    return {
      userStats: {
        total: totalUsers || 0,
        verified: verifiedUsers || 0,
        withDeposits: usersWithDeposits || 0
      },
      depositStats: {
        total: totalDeposits || 0,
        approved: totalDepositAmount
      },
      lendingStats: {
        totalMatches: totalMatches || 0,
        volume: totalLendingVolume
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
