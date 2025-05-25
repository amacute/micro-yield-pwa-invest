
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Users, User, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

type NotificationType = 'info' | 'warning' | 'success' | 'error';
type NotificationTarget = 'all' | 'specific';

interface NotificationForm {
  title: string;
  message: string;
  type: NotificationType;
  target: NotificationTarget;
  targetUsers: string[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  target: NotificationTarget;
  targetUsers: string[];
  createdAt: Date;
  sentBy: string;
  status: 'draft' | 'sent';
}

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com' },
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight from 2-4 AM EST.',
    type: 'warning',
    target: 'all',
    targetUsers: [],
    createdAt: new Date(Date.now() - 3600000),
    sentBy: 'Admin',
    status: 'sent'
  },
  {
    id: '2',
    title: 'New Feature Release',
    message: 'We have launched new P2P matching features!',
    type: 'success',
    target: 'all',
    targetUsers: [],
    createdAt: new Date(Date.now() - 7200000),
    sentBy: 'Admin',
    status: 'sent'
  }
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [newNotification, setNewNotification] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'info',
    target: 'all',
    targetUsers: []
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'info': return <Info className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const handleSendNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newNotification.target === 'specific' && newNotification.targetUsers.length === 0) {
      toast.error('Please select at least one user for targeted notifications');
      return;
    }

    const notification: Notification = {
      id: Date.now().toString(),
      ...newNotification,
      createdAt: new Date(),
      sentBy: 'Admin',
      status: 'sent'
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
  };

  const handleInputChange = (field: keyof NotificationForm, value: any) => {
    setNewNotification(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Notification Center</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send New Notification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send New Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newNotification.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Notification title"
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={newNotification.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Notification message"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newNotification.type} onValueChange={(value: NotificationType) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target">Target</Label>
                <Select value={newNotification.target} onValueChange={(value: NotificationTarget) => handleInputChange('target', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="specific">Specific Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newNotification.target === 'specific' && (
              <div>
                <Label>Select Users</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                  {mockUsers.map(user => (
                    <div key={user.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={newNotification.targetUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('targetUsers', [...newNotification.targetUsers, user.id]);
                          } else {
                            handleInputChange('targetUsers', newNotification.targetUsers.filter(id => id !== user.id));
                          }
                        }}
                      />
                      <label htmlFor={`user-${user.id}`} className="text-sm">
                        {user.name} ({user.email})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleSendNotification} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notifications.map(notification => (
                <div key={notification.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getNotificationColor(notification.type)}>
                        {getNotificationIcon(notification.type)}
                        {notification.type}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {notification.target === 'all' ? <Users className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {notification.target === 'all' ? 'All Users' : `${notification.targetUsers.length} Users`}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {notification.createdAt.toLocaleTimeString()}
                    </span>
                  </div>
                  <h4 className="font-medium">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{notifications.filter(n => n.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Broadcast</p>
                <p className="text-2xl font-bold">{notifications.filter(n => n.target === 'all').length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Targeted</p>
                <p className="text-2xl font-bold">{notifications.filter(n => n.target === 'specific').length}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
