
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Shield, ShieldOff, User } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  is_blocked: boolean;
  kyc_verified: boolean;
  wallet_balance: number;
  created_at: string;
  last_login?: string;
}

export function UserBlockingManagement() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    // Mock user data
    const mockUsers: UserAccount[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        is_blocked: false,
        kyc_verified: true,
        wallet_balance: 1500,
        created_at: '2024-01-15T10:30:00Z',
        last_login: '2024-01-20T14:22:00Z'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        is_blocked: true,
        kyc_verified: false,
        wallet_balance: 250,
        created_at: '2024-01-10T09:15:00Z',
        last_login: '2024-01-18T11:45:00Z'
      },
      {
        id: '3',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        is_blocked: false,
        kyc_verified: true,
        wallet_balance: 3200,
        created_at: '2024-01-05T16:20:00Z',
        last_login: '2024-01-21T09:30:00Z'
      }
    ];
    setUsers(mockUsers);
  };

  const toggleUserBlock = async (userId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update user block status
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, is_blocked: !currentStatus }
            : user
        )
      );

      const action = currentStatus ? 'unblocked' : 'blocked';
      toast.success(`User successfully ${action}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Account Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={user.kyc_verified ? 'default' : 'secondary'}>
                          {user.kyc_verified ? 'KYC Verified' : 'Not Verified'}
                        </Badge>
                        <Badge variant={user.is_blocked ? 'destructive' : 'default'}>
                          {user.is_blocked ? 'Blocked' : 'Active'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-4 mb-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Wallet Balance</p>
                        <p className="font-medium">{formatCurrency(user.wallet_balance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Joined</p>
                        <p className="font-medium">{formatDate(user.created_at)}</p>
                      </div>
                    </div>
                    <Button
                      variant={user.is_blocked ? "default" : "destructive"}
                      size="sm"
                      onClick={() => toggleUserBlock(user.id, user.is_blocked)}
                      disabled={loading}
                      className="w-24"
                    >
                      {user.is_blocked ? (
                        <>
                          <ShieldOff className="h-4 w-4 mr-1" />
                          Unblock
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-1" />
                          Block
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {user.last_login && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Last login: {formatDate(user.last_login)}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Users Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No users match your search criteria.' : 'No users registered yet.'}
                </p>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{users.filter(u => u.is_blocked).length}</p>
                <p className="text-sm text-muted-foreground">Blocked Users</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{users.filter(u => !u.is_blocked).length}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
