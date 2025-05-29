
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

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
      .select('amount');
    
    const totalP2PVolume = p2pVolume?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
    
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
