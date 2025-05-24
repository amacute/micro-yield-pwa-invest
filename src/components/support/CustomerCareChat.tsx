
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { sendToWhatsApp, getAIResponse } from './chatService';
import { Message, CustomerCareChatProps } from './types';

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
    
    // Send to WhatsApp
    await sendToWhatsApp(message);
    
    const currentMessage = message;
    setMessage('');
    
    // Simulate bot typing
    setIsTyping(true);
    
    try {
      const aiResponse = await getAIResponse(currentMessage, messages);
      
      // Add bot response
      const newBotMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      // Fallback response if the API call fails
      setTimeout(() => {
        const fallbackMessage: Message = {
          id: Date.now().toString(),
          content: "I'm having trouble connecting to my services right now. Please try again later or contact our support team directly.",
          isBot: true,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
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
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="p-4 pt-2 border-t">
            <ChatInput
              message={message}
              onMessageChange={setMessage}
              onSendMessage={handleSendMessage}
            />
          </CardFooter>
        </Card>
      )}
    </div>
  );
};
