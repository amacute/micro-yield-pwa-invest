
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract API key from headers or environment
    const apiKey = req.headers.get('apikey') || '6d432c28038d77b50025adad10f0e824';
    
    // Get request body
    const { message, previousMessages = [] } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ success: false, message: 'Message is required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    console.log('Received message:', message);
    console.log('Previous messages:', previousMessages);

    // Prepare system message for context
    const systemMessage = {
      role: 'system',
      content: `You are a helpful customer support assistant for Axiomify, a P2P investment platform. 
      You help users with questions about investments, account management, and platform features.
      Be friendly, helpful, and concise. If you don't know an answer, suggest contacting our support team directly.
      Some key information:
      - Minimum investment amount is $10
      - We support bank transfers and card payments
      - KYC verification is required for investments over $1000
      - Withdrawal processing takes 1-3 business days
      - Our platform offers P2P loans with returns from 6-12% annually`
    };

    // Format conversation history
    const formattedMessages = [
      systemMessage,
      ...previousMessages.slice(-10), // Only keep the last 10 messages to avoid token limits
      { role: 'user', content: message }
    ];

    // Simulate API response for development/demo purposes
    // In a production environment, this would call the actual OpenAI API
    const mockResponses = {
      'investment': 'Our P2P investment platform offers various investment opportunities with different risk profiles. The minimum investment amount is $10. Would you like me to explain more about specific investment types?',
      'account': 'You can manage your account settings in the Profile section. If you need to update your personal information or change your password, you'll find those options there.',
      'verify': 'To verify your email, please check your inbox for a verification link we sent when you signed up. If you can\'t find it, you can request a new verification email from your profile page.',
      'withdraw': 'You can withdraw funds from your wallet page. Processing typically takes 1-3 business days depending on your bank.',
      'deposit': 'We support multiple payment methods including bank transfers and cards. To add funds, go to your wallet page and click on "Deposit".',
      'help': 'I'm here to help! Feel free to ask about investments, account management, deposits/withdrawals, or any other feature of our platform.',
      'hello': 'Hello! How can I assist you today with Axiomify\'s services?',
      'hi': 'Hi there! How can I help you with Axiomify today?'
    };

    // Determine which mock response to use based on keywords in the message
    let response = 'I'm not sure how to help with that. Would you like to speak with a human agent?';
    const lowerMessage = message.toLowerCase();
    
    for (const [keyword, reply] of Object.entries(mockResponses)) {
      if (lowerMessage.includes(keyword)) {
        response = reply;
        break;
      }
    }

    // Log the response
    console.log('Sending response:', response);

    return new Response(
      JSON.stringify({ 
        success: true, 
        response
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error in chatbot function:', error);
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});
