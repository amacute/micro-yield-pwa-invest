
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function BalanceCard() {
  const { user } = useAuth();
  
  const handleAddFunds = () => {
    // Trigger deposit view
    window.location.hash = 'deposit';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };
  
  return (
    <Card className="bg-gradient-to-r from-axiom-primary to-axiom-secondary text-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-white/80 text-sm font-medium">Available Balance</p>
            <h2 className="text-3xl font-bold mt-1">
              {user?.currencySymbol}{user?.walletBalance.toFixed(2) || '0.00'}
            </h2>
          </div>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
            onClick={handleAddFunds}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Funds
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-white/80 text-xs">Active Investments</p>
            <p className="font-medium">3</p>
          </div>
          <div>
            <p className="text-white/80 text-xs">Total Returns</p>
            <p className="font-medium">{user?.currencySymbol}350.75</p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
            onClick={() => window.location.hash = 'withdraw'}
          >
            Withdraw
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            Transaction History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
