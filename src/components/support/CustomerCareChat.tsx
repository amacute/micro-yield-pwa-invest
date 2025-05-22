
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface CustomerCareChatProps {
  className?: string;
}

export const CustomerCareChat = ({ className }: CustomerCareChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Axiomify's AI assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isBot: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Simulate bot typing
    setIsTyping(true);
    
    // Simulate bot response based on keywords
    setTimeout(() => {
      setIsTyping(false);
      
      let botResponse = "I'm not sure how to help with that. Would you like to speak with a human agent?";
      
      // Simple keyword matching for demo purposes
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('investment') || lowerMessage.includes('invest')) {
        botResponse = "Our P2P investment platform offers various investment opportunities with different risk profiles. The minimum investment amount is $10. Would you like me to explain more about specific investment types?";
      } else if (lowerMessage.includes('account') || lowerMessage.includes('sign up') || lowerMessage.includes('register')) {
        botResponse = "You can create an account by clicking on the 'Sign Up' button in the top navigation bar. The process takes less than a minute!";
      } else if (lowerMessage.includes('withdraw') || lowerMessage.includes('deposit')) {
        botResponse = "You can manage deposits and withdrawals from your wallet page after logging in. We support multiple payment methods including bank transfers and cards.";
      } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        botResponse = "Hello! How can I assist you today with Axiomify's services?";
      }
      
      const newBotMessage: Message = {
        id: Date.now().toString(),
        content: botResponse,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newBotMessage]);
    }, 1500);
  };

  return (
    <div className={cn("fixed bottom-16 md:bottom-8 right-4", className)}>
      {/* Chat bubble button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg bg-axiom-primary hover:bg-axiom-secondary"
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </Button>
      
      {/* Chat window */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 md:w-96 shadow-lg">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-lg flex items-center">
              <MessageCircle size={18} className="mr-2 text-axiom-primary" />
              Customer Support
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 max-h-[400px] overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 ${
                  msg.isBot ? 'flex' : 'flex justify-end'
                }`}
              >
                {msg.isBot && (
                  <div className="h-8 w-8 mr-2 rounded-full bg-axiom-primary/10 flex items-center justify-center text-axiom-primary">
                    <MessageCircle size={14} />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    msg.isBot
                      ? 'bg-muted/50 text-foreground'
                      : 'bg-axiom-primary text-white ml-2'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!msg.isBot && (
                  <div className="h-8 w-8 ml-2 rounded-full bg-axiom-primary/10 flex items-center justify-center text-axiom-primary">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex mb-4">
                <div className="h-8 w-8 mr-2 rounded-full bg-axiom-primary/10 flex items-center justify-center text-axiom-primary">
                  <MessageCircle size={14} />
                </div>
                <div className="bg-muted/50 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="p-4 pt-2 border-t">
            <form onSubmit={handleSendMessage} className="w-full flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="icon" className="bg-axiom-primary hover:bg-axiom-secondary">
                <Send size={16} />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};
