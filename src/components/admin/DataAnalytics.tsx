
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { fetchAnalyticsData } from '@/services/admin';
import { CircleDollarSign, Users, ArrowUpRightSquare, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalyticCard } from './analytics/AnalyticCard';
import { AnalyticChart } from './analytics/AnalyticChart';

export function DataAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAnalyticsData();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Mock data for charts
  const investmentData = [
    { name: 'Jan', volume: 12000 },
    { name: 'Feb', volume: 19000 },
    { name: 'Mar', volume: 17000 },
    { name: 'Apr', volume: 21000 },
    { name: 'May', volume: 28000 },
    { name: 'Jun', volume: 32000 },
  ];

  const userGrowthData = [
    { name: 'Jan', users: 50 },
    { name: 'Feb', users: 120 },
    { name: 'Mar', users: 190 },
    { name: 'Apr', users: 240 },
    { name: 'May', users: 350 },
    { name: 'Jun', users: 450 },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnalyticCard
          title="Total Users"
          value={analyticsData?.userStats?.total || 0}
          description={`${analyticsData?.userStats?.verified || 0} verified`}
          icon={<Users />}
        />
        
        <AnalyticCard
          title="Total Investments"
          value={analyticsData?.investmentStats?.total || 0}
          description="Active opportunities"
          icon={<ArrowUpRightSquare />}
        />
        
        <AnalyticCard
          title="P2P Loans"
          value={analyticsData?.loanStats?.total || 0}
          description="Matching opportunities"
          icon={<TrendingUp />}
        />
        
        <AnalyticCard
          title="Total Investment Volume"
          value={`$${(analyticsData?.investmentStats?.raised || 0).toLocaleString()}`}
          description="Capital deployed"
          icon={<CircleDollarSign />}
        />
        
        <AnalyticCard
          title="P2P Funded Amount"
          value={`$${(analyticsData?.loanStats?.funded || 0).toLocaleString()}`}
          description="Peer-to-peer lending"
          icon={<CircleDollarSign />}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <AnalyticChart title="Investment Volume">
          <ChartContainer
            config={{
              volume: {
                color: "#0EA5E9",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={investmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="volume" name="Volume" fill="var(--color-volume)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </AnalyticChart>

        <AnalyticChart title="User Growth">
          <ChartContainer
            config={{
              users: {
                color: "#10B981",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="var(--color-users)"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </AnalyticChart>
      </div>
    </div>
  );
}
