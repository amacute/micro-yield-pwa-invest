import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, LineChart, DollarSign, PieChart, MessageSquare } from 'lucide-react';
import { UserManagement } from '@/components/admin/UserManagement';
import { InvestmentManagement } from '@/components/admin/InvestmentManagement';
import { P2PMatching } from '@/components/admin/P2PMatching';
import { DataAnalytics } from '@/components/admin/DataAnalytics';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { AdminDashboardHeader } from '@/components/admin/AdminDashboardHeader';
import { AdminMessaging } from '@/components/admin/AdminMessaging';

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Mock admin stats
  const stats = [
    {
      title: "Total Users",
      value: "1,246",
      change: {
        value: "12%",
        label: "From last month",
        positive: true,
      },
      icon: <Users size={20} />,
    },
    {
      title: "Active Investments",
      value: "48",
      change: {
        value: "8%",
        label: "From last month",
        positive: true,
      },
      icon: <LineChart size={20} />,
    },
    {
      title: "Investment Volume",
      value: "$234,578",
      change: {
        value: "14%",
        label: "From last month",
        positive: true,
      },
      icon: <DollarSign size={20} />,
    },
    {
      title: "Verification Rate",
      value: "68%",
      change: {
        value: "5%",
        label: "From last month",
        positive: true,
      },
      icon: <PieChart size={20} />,
    },
  ];
  
  return (
    <div className="space-y-6">
      <AdminDashboardHeader 
        title="Admin Dashboard" 
        description="Manage platform investments and users" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <AdminStatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
          />
        ))}
      </div>
      
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="p2p">P2P Matching</TabsTrigger>
          <TabsTrigger value="messaging">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>Messaging</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-4">
          <DataAnalytics />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="investments" className="space-y-4">
          <InvestmentManagement />
        </TabsContent>
        
        <TabsContent value="p2p" className="space-y-4">
          <P2PMatching />
        </TabsContent>
        
        <TabsContent value="messaging" className="space-y-4">
          <AdminMessaging />
        </TabsContent>
      </Tabs>
    </div>
  );
}
