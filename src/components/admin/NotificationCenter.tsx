
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Bell, Send, Users } from 'lucide-react';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success'>('info');

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('is_blocked', false);
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const sendNotification = async () => {
    if (!title || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const recipients = selectedUsers.length > 0 ? selectedUsers : users.map(u => u.id);
      
      const notifications = recipients.map(userId => ({
        user_id: userId,
        title,
        message,
        type,
        read: false
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);
      
      if (error) throw error;
      
      toast.success(`Notification sent to ${recipients.length} users`);
      setTitle('');
      setMessage('');
      setSelectedUsers([]);
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Notification title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          
          <Textarea
            placeholder="Notification message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
          />
          
          <div className="flex gap-2">
            <Button
              variant={type === 'info' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('info')}
            >
              Info
            </Button>
            <Button
              variant={type === 'warning' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('warning')}
            >
              Warning
            </Button>
            <Button
              variant={type === 'success' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('success')}
            >
              Success
            </Button>
          </div>
          
          <Button onClick={sendNotification} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Send to {selectedUsers.length > 0 ? selectedUsers.length : users.length} Users
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.slice(0, 10).map(notification => (
              <div key={notification.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={
                    notification.type === 'success' ? 'default' :
                    notification.type === 'warning' ? 'destructive' : 'secondary'
                  }>
                    {notification.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
