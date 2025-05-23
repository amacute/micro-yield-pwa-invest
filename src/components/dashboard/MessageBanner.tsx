
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X, AlertCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  title: string;
  content: string;
  type: 'announcement' | 'alert' | 'important';
  date: string;
}

interface MessageBannerProps {
  messages: Message[];
}

export function MessageBanner({ messages }: MessageBannerProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [dismissedMessages, setDismissedMessages] = useState<number[]>([]);
  
  const activeMessages = messages.filter(msg => !dismissedMessages.includes(msg.id));
  
  if (activeMessages.length === 0) return null;
  
  const currentMessage = activeMessages[currentMessageIndex];
  
  const dismissMessage = (id: number) => {
    setDismissedMessages([...dismissedMessages, id]);
    if (currentMessageIndex >= activeMessages.length - 1) {
      setCurrentMessageIndex(0);
    }
  };
  
  const nextMessage = () => {
    setCurrentMessageIndex((prev) => (prev + 1) % activeMessages.length);
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Bell className="h-4 w-4" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4" />;
      case 'important':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'alert':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'important':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };
  
  return (
    <Card className={cn(
      "mb-6 px-4 py-3 shadow-sm",
      getTypeStyles(currentMessage.type)
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {getTypeIcon(currentMessage.type)}
          <div>
            <div className="font-medium">{currentMessage.title}</div>
            <div className="text-sm">{currentMessage.content}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {activeMessages.length > 1 && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={nextMessage}
              className="h-8"
            >
              Next
            </Button>
          )}
          <Button 
            size="sm"
            variant="ghost" 
            onClick={() => dismissMessage(currentMessage.id)}
            className="h-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
