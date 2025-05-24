
import { toast } from '@/components/ui/sonner';
import { Message } from './types';

const AI_API_KEY = '6d432c28038d77b50025adad10f0e824';
const WHATSAPP_NUMBER = '+16463510973';

export const sendToWhatsApp = async (message: string) => {
  try {
    await fetch('https://vyensygnzdllcwyzuxkq.supabase.co/functions/v1/whatsapp-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZW5zeWduemRsbGN3eXp1eGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzI1NTksImV4cCI6MjA2MzQwODU1OX0.pcfG8-ggEjuGhvB1VtxUORKPB4cTWLsFM_ZFCxvWE_g`
      },
      body: JSON.stringify({
        message,
        from: 'web_chat',
        to: WHATSAPP_NUMBER
      })
    });
  } catch (error) {
    console.error('Error sending to WhatsApp:', error);
  }
};

export const getAIResponse = async (message: string, messages: Message[]) => {
  try {
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
    return data.response || "I'm sorry, I couldn't process that request. Can you try again?";
  } catch (error) {
    console.error('Error getting AI response:', error);
    toast.error('Failed to connect to AI services');
    throw error;
  }
};
