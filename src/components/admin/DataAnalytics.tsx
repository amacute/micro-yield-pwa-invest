
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { fetchAnalyticsData } from '@/services/admin';
import { CircleDollarSign, Users, ArrowUpRightSquare, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Skeleton className="w-full h-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Skeleton className="w-full h-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.userStats?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.userStats?.verified || 0} verified
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Investments
            </CardTitle>
            <ArrowUpRightSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.investmentStats?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active opportunities
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">
              P2P Loans
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.loanStats?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Matching opportunities
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Investment Volume
            </CardTitle>
            <CircleDollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(analyticsData?.investmentStats?.raised || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Capital deployed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">
              P2P Funded Amount
            </CardTitle>
            <CircleDollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(analyticsData?.loanStats?.funded || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Peer-to-peer lending
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Investment Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
