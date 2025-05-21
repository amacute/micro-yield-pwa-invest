
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InvestmentCard } from '@/components/investments/InvestmentCard';
import { useInvestment } from '@/contexts/InvestmentContext';
import { Search } from 'lucide-react';

export default function Investments() {
  const { availableInvestments } = useInvestment();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filterInvestments = (category: string | null) => {
    let filtered = availableInvestments;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(inv => 
        inv.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        inv.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category if not "all"
    if (category && category !== 'all') {
      filtered = filtered.filter(inv => inv.category === category);
    }
    
    return filtered;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Investment Opportunities</h1>
        <p className="text-muted-foreground">Browse and discover high-yield investment options</p>
      </div>
      
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search investments"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">Filters</Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Real Estate">Real Estate</TabsTrigger>
          <TabsTrigger value="Business">Business</TabsTrigger>
          <TabsTrigger value="Crypto">Crypto</TabsTrigger>
          <TabsTrigger value="P2P">P2P</TabsTrigger>
        </TabsList>
        
        {['all', 'Real Estate', 'Business', 'Crypto', 'P2P'].map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filterInvestments(category === 'all' ? null : category).map((investment) => (
                <InvestmentCard key={investment.id} investment={investment} />
              ))}
              
              {filterInvestments(category === 'all' ? null : category).length === 0 && (
                <div className="col-span-2 py-12 text-center">
                  <p className="text-muted-foreground">No investment opportunities found</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
