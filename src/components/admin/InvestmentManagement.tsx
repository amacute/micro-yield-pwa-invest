
import { useState, useEffect } from 'react';
import { fetchInvestments, createInvestment } from '@/services/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Settings } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

export function InvestmentManagement() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    min_investment: 50,
    max_investment: 5000,
    return_rate: 5.5,
    duration: 30,
    goal: 50000,
    risk: 'Medium',
    category: 'Real Estate',
    end_time: ''
  });
  
  useEffect(() => {
    const loadInvestments = async () => {
      const data = await fetchInvestments();
      setInvestments(data);
      setLoading(false);
    };
    
    loadInvestments();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCreateInvestment = async () => {
    try {
      // Calculate end time based on duration (in hours)
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + formData.duration);
      
      const newInvestment = {
        ...formData,
        end_time: endTime.toISOString(),
        status: 'active',
        creator_id: (await supabase.auth.getUser()).data.user?.id
      };
      
      const createdInvestment = await createInvestment(newInvestment);
      
      if (createdInvestment) {
        setInvestments(prev => [createdInvestment, ...prev]);
        setShowCreateDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating investment:', error);
      toast.error('Failed to create investment');
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      min_investment: 50,
      max_investment: 5000,
      return_rate: 5.5,
      duration: 30,
      goal: 50000,
      risk: 'Medium',
      category: 'Real Estate',
      end_time: ''
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Investment Management
        </h2>
        
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Investment
        </Button>
      </div>
      
      {investments.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">No investments found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investments.map(investment => (
            <Card key={investment.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{investment.title}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    investment.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    investment.status === 'funded' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                    investment.status === 'completed' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm line-clamp-2">{investment.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p>{investment.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Risk</p>
                      <p>{investment.risk}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Return Rate</p>
                      <p>{investment.return_rate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p>{investment.duration} hours</p>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-1">Funding Progress</p>
                    <div className="flex justify-between text-sm mb-1">
                      <span>${investment.raised.toLocaleString()}</span>
                      <span>${investment.goal.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-axiom-primary h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (investment.raised / investment.goal) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="pt-2 flex justify-end gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Investment</DialogTitle>
            <DialogDescription>
              Fill out the details for a new investment opportunity.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="min_investment">Min Investment ($)</Label>
                <Input
                  id="min_investment"
                  name="min_investment"
                  type="number"
                  value={formData.min_investment}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="max_investment">Max Investment ($)</Label>
                <Input
                  id="max_investment"
                  name="max_investment"
                  type="number"
                  value={formData.max_investment}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="return_rate">Return Rate (%)</Label>
                <Input
                  id="return_rate"
                  name="return_rate"
                  type="number"
                  value={formData.return_rate}
                  onChange={handleInputChange}
                  step="0.1"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="goal">Funding Goal ($)</Label>
              <Input
                id="goal"
                name="goal"
                type="number"
                value={formData.goal}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="risk">Risk Level</Label>
                <Select 
                  value={formData.risk}
                  onValueChange={(value) => handleSelectChange('risk', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Crypto">Crypto</SelectItem>
                    <SelectItem value="P2P">P2P</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateInvestment}>Create Investment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
