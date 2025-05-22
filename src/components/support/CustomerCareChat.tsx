
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface CustomerCareChatProps {
  className?: string;
}

const AI_API_KEY = '6d432c28038d77b50025adad10f0e824';

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
    
    try {
      // Call our Supabase edge function with the OpenAI integration
      const response = await fetch('https://vyensygnzdllcwyzuxkq.supabase.co/functions/v1/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZW5zeWduemRsbGN3eXp1eGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzI1NTksImV4cCI6MjA2MzQwODU1OX0.pcfG8-ggEjuGhvB1VtxUORKPB4cTWLsFM_ZFCxvWE_g`,
          'apikey': AI_API_KEY
        },
        body: JSON.stringify({
          message: message,
          previousMessages: messages.map(msg => ({
            role: msg.isBot ? 'assistant' : 'user',
            content: msg.content
          }))
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }
      
      const data = await response.json();
      
      // Add bot response
      const newBotMessage: Message = {
        id: Date.now().toString(),
        content: data.response || "I'm sorry, I couldn't process that request. Can you try again?",
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response if the API call fails
      setTimeout(() => {
        const fallbackMessage: Message = {
          id: Date.now().toString(),
          content: "I'm having trouble connecting to my services right now. Please try again later or contact our support team directly.",
          isBot: true,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
        toast.error('Failed to connect to AI services');
      }, 1000);
    } finally {
      setIsTyping(false);
    }
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
