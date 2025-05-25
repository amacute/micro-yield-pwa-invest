
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, User, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  recipient_type: 'all' | 'specific';
  recipient_id?: string;
  created_at: string;
  read: boolean;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    recipient_type: 'all' as const,
    recipient_id: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    // Mock notifications data
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 2-4 AM',
        type: 'warning',
        recipient_type: 'all',
        created_at: new Date().toISOString(),
        read: false
      },
      {
        id: '2',
        title: 'Investment Expired',
        message: 'Investment #12345 has expired and needs manual matching',
        type: 'error',
        recipient_type: 'specific',
        recipient_id: 'admin',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        read: true
      }
    ];
    setNotifications(mockNotifications);
  };

  const sendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const notification: Notification = {
        id: `notif_${Date.now()}`,
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        recipient_type: newNotification.recipient_type,
        recipient_id: newNotification.recipient_id || undefined,
        created_at: new Date().toISOString(),
        read: false
      };

      setNotifications(prev => [notification, ...prev]);
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        recipient_type: 'all',
        recipient_id: ''
      });

      toast.success('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Send New Notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={newNotification.title}
                onChange={(e) => setNewNotification(prev => ({...prev, title: e.target.value}))}
                placeholder="Notification title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={newNotification.type}
                onChange={(e) => setNewNotification(prev => ({...prev, type: e.target.value as any}))}
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <Textarea
              value={newNotification.message}
              onChange={(e) => setNewNotification(prev => ({...prev, message: e.target.value}))}
              placeholder="Notification message"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Recipient</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={newNotification.recipient_type}
                onChange={(e) => setNewNotification(prev => ({...prev, recipient_type: e.target.value as any}))}
              >
                <option value="all">All Users</option>
                <option value="specific">Specific User</option>
              </select>
            </div>
            {newNotification.recipient_type === 'specific' && (
              <div>
                <label className="text-sm font-medium mb-2 block">User ID</label>
                <Input
                  value={newNotification.recipient_id}
                  onChange={(e) => setNewNotification(prev => ({...prev, recipient_id: e.target.value}))}
                  placeholder="Enter user ID"
                />
              </div>
            )}
          </div>

          <Button onClick={sendNotification} disabled={loading} className="w-full">
            {loading ? 'Sending...' : 'Send Notification'}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(notification.type)}>
                      {notification.type}
                    </Badge>
                    <Badge variant={notification.recipient_type === 'all' ? 'default' : 'secondary'}>
                      {notification.recipient_type === 'all' ? 'All Users' : 'Specific'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm mb-2">{notification.message}</p>
                {notification.recipient_id && (
                  <p className="text-xs text-muted-foreground">
                    Sent to: {notification.recipient_id}
                  </p>
                )}
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Notifications</h3>
                <p className="text-muted-foreground">No notifications have been sent yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
