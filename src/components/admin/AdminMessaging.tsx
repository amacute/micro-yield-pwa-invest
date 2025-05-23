
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Bell, MessageSquare, Send } from 'lucide-react';

// Mock data for previous announcements
const previousMessages = [
  {
    id: 1,
    title: 'New Investment Opportunity',
    content: 'Don\'t miss our latest high return investment opportunity!',
    type: 'announcement',
    sentDate: '2025-05-20',
    recipient: 'all'
  },
  {
    id: 2,
    title: 'Platform Maintenance',
    content: 'Scheduled maintenance on May 25th, 2025 from 2AM to 4AM UTC.',
    type: 'important',
    sentDate: '2025-05-18',
    recipient: 'all'
  },
  {
    id: 3,
    title: 'Verification Required',
    content: 'Please complete your KYC verification to unlock full platform features.',
    type: 'alert',
    sentDate: '2025-05-15',
    recipient: 'unverified'
  }
];

export function AdminMessaging() {
  const [messageType, setMessageType] = useState<'announcement' | 'alert' | 'important'>('announcement');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [recipients, setRecipients] = useState('all');
  const [isSending, setIsSending] = useState(false);
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'alert':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'important':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return '';
    }
  };
  
  const handleSendMessage = async () => {
    if (!messageTitle.trim()) {
      toast.error('Please enter a message title');
      return;
    }
    
    if (!messageContent.trim()) {
      toast.error('Please enter a message content');
      return;
    }
    
    setIsSending(true);
    try {
      // In a real application, this would send the message to the backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Message sent successfully');
      
      // Reset form
      setMessageTitle('');
      setMessageContent('');
      setMessageType('announcement');
      setRecipients('all');
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messaging Center</CardTitle>
        <CardDescription>
          Send announcements and notifications to users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="new" className="space-y-4">
          <TabsList>
            <TabsTrigger value="new">New Message</TabsTrigger>
            <TabsTrigger value="previous">Previous Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="message-title">Message Title</Label>
                  <Input
                    id="message-title"
                    placeholder="Enter message title"
                    value={messageTitle}
                    onChange={(e) => setMessageTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="message-type">Type</Label>
                    <Select 
                      value={messageType} 
                      onValueChange={(value) => setMessageType(value as any)}
                    >
                      <SelectTrigger id="message-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="announcement">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            <span>Announcement</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="important">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>Important</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="alert">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>Alert</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="recipients">Recipients</Label>
                    <Select 
                      value={recipients} 
                      onValueChange={setRecipients}
                    >
                      <SelectTrigger id="recipients">
                        <SelectValue placeholder="Select recipients" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="active">Active Investors</SelectItem>
                        <SelectItem value="verified">Verified Users</SelectItem>
                        <SelectItem value="unverified">Unverified Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="message-content">Message Content</Label>
                <Textarea
                  id="message-content"
                  placeholder="Enter your message here"
                  rows={5}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                />
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleSendMessage} 
                disabled={isSending}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSending ? 'Sending...' : 'Send Message'}
              </Button>
              
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Message Preview</h4>
                <div className={`p-3 rounded-md ${
                  messageType === 'announcement' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  messageType === 'important' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                  'bg-red-100 dark:bg-red-900/20'
                }`}>
                  <h5 className="font-medium mb-1">{messageTitle || 'Message Title'}</h5>
                  <p className="text-sm">{messageContent || 'Message content will appear here'}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="previous">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Sent</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previousMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="font-medium">{message.title}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(message.type)}>
                        {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{message.sentDate}</TableCell>
                    <TableCell>
                      {message.recipient === 'all' ? 'All Users' : 
                       message.recipient === 'active' ? 'Active Investors' :
                       message.recipient === 'verified' ? 'Verified Users' : 'Unverified Users'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm"
                        onClick={() => {
                          setMessageType(message.type as any);
                          setMessageTitle(message.title);
                          setMessageContent(message.content);
                          setRecipients(message.recipient);
                          
                          // Switch to new message tab
                          const tabsElement = document.querySelector('[data-value="new"]');
                          if (tabsElement) {
                            (tabsElement as HTMLElement).click();
                          }
                        }}
                      >
                        Copy & Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
