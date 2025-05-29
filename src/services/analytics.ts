
import { supabase } from "@/integrations/supabase/client";

export const fetchAnalyticsData = async () => {
  try {
    // Fetch user count
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Fetch transaction data
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*');

    // Fetch investment data
    const { data: investments } = await supabase
      .from('investments')
      .select('*');

    return {
      totalUsers: userCount || 0,
      totalTransactions: transactions?.length || 0,
      totalInvestments: investments?.length || 0,
      totalVolume: transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0,
      totalInvested: investments?.reduce((sum, i) => sum + Number(i.amount), 0) || 0,
      transactions: transactions || [],
      investments: investments || []
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return {
      totalUsers: 0,
      totalTransactions: 0,
      totalInvestments: 0,
      totalVolume: 0,
      totalInvested: 0,
      transactions: [],
      investments: []
    };
  }
};

export const getRevenueData = () => {
  // Mock data for revenue analytics
  return [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 19000 },
    { month: 'Mar', revenue: 15000 },
    { month: 'Apr', revenue: 22000 },
    { month: 'May', revenue: 28000 },
    { month: 'Jun', revenue: 25000 },
  ];
};

export const getUserGrowthData = () => {
  // Mock data for user growth
  return [
    { month: 'Jan', users: 1200 },
    { month: 'Feb', users: 1900 },
    { month: 'Mar', users: 2100 },
    { month: 'Apr', users: 2800 },
    { month: 'May', users: 3200 },
    { month: 'Jun', users: 3600 },
  ];
};
