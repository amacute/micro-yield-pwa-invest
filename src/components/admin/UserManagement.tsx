
import { useState, useEffect } from 'react';
import { fetchUsers } from '@/services/admin';
import { toast } from '@/components/ui/sonner';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertCircle, Search, UserRoundCog } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  
  useEffect(() => {
    const loadUsers = async () => {
      const data = await fetchUsers();
      setUsers(data);
      setFilteredUsers(data);
      setLoading(false);
    };
    
    loadUsers();
  }, []);
  
  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        user => 
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);
  
  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };
  
  const handleVerifyKYC = async (userId: string) => {
    try {
      // In a real app, this would be an admin-only operation with proper confirmation
      const { error } = await supabase
        .from('users')
        .update({ kyc_verified: true })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update the local state
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, kyc_verified: true } : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(
        u => 
          u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      
      toast.success('User KYC verified successfully');
    } catch (error) {
      console.error('Error verifying KYC:', error);
      toast.error('Failed to verify user KYC');
    }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <UserRoundCog className="h-5 w-5" />
          User Management
        </h2>
        
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.name || "—"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>${user.wallet_balance.toFixed(2)}</TableCell>
                  <TableCell>
                    {user.kyc_verified ? (
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <Check className="h-4 w-4 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewUser(user)}
                      >
                        View
                      </Button>
                      
                      {!user.kyc_verified && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleVerifyKYC(user.id)}
                        >
                          Verify KYC
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information for this user.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedUser.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="font-medium">${selectedUser.wallet_balance.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">KYC Status</p>
                  <p className="font-medium">
                    {selectedUser.kyc_verified ? (
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <Check className="h-4 w-4 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Pending
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowUserDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
