
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Users, User } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  target: 'all' | 'specific';
  targetUsers?: string[];
  created_at: string;
  sent: boolean;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    target: 'all' as const,
    targetUsers: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    // Mock notification data
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur on Sunday night.',
        type: 'warning',
        target: 'all',
        created_at: new Date().toISOString(),
        sent: true
      },
      {
        id: '2',
        title: 'New Investment Available',
        message: 'A new high-yield investment opportunity is now available.',
        type: 'success',
        target: 'all',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        sent: true
      }
    ];
    setNotifications(mockNotifications);
  };

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const notification: Notification = {
        id: Date.now().toString(),
        ...newNotification,
        created_at: new Date().toISOString(),
        sent: true
      };

      setNotifications(prev => [notification, ...prev]);
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
        targetUsers: []
      });

      toast.success('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getTypeBadge = (type: string) => {
    const variant = type === 'success' ? 'default' : 
                   type === 'warning' ? 'secondary' : 
                   type === 'error' ? 'destructive' : 'outline';
    return <Badge variant={variant}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Send New Notification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newNotification.title}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select 
                  value={newNotification.type} 
                  onValueChange={(value: 'info' | 'warning' | 'success' | 'error') => 
                    setNewNotification(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Notification message"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Target Audience</label>
              <Select 
                value={newNotification.target} 
                onValueChange={(value: 'all' | 'specific') => 
                  setNewNotification(prev => ({ ...prev, target: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="specific">Specific Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSendNotification} disabled={loading} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send Notification'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{notification.title}</h3>
                  <div className="flex items-center gap-2">
                    {getTypeBadge(notification.type)}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {notification.target === 'all' ? (
                        <>
                          <Users className="h-4 w-4" />
                          All Users
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4" />
                          Specific Users
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground mb-2">{notification.message}</p>
                <div className="text-xs text-muted-foreground">
                  Sent: {new Date(notification.created_at).toLocaleString()}
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No notifications sent yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
