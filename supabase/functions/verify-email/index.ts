
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://vyensygnzdllcwyzuxkq.supabase.co';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZW5zeWduemRsbGN3eXp1eGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzI1NTksImV4cCI6MjA2MzQwODU1OX0.pcfG8-ggEjuGhvB1VtxUORKPB4cTWLsFM_ZFCxvWE_g';
const API_KEY = Deno.env.get('EMAIL_VERIFICATION_API_KEY') || '6d432c28038d77b50025adad10f0e824';

// Create a single supabase client for interacting with your database
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email is required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Generate a verification token
    const token = crypto.randomUUID();
    
    // In a real application, you would store this token in your database
    // along with the email and an expiration time
    
    // For this demo, we'll just log it (in a real app, you'd send an email)
    console.log(`Verification token for ${email}: ${token}`);

    // Simulate sending an email
    // In a real app, this would call your email service provider
    
    // Generate verification URL
    const verificationUrl = `${req.headers.get('origin') || 'https://axiomify.app'}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    
    console.log(`Verification URL: ${verificationUrl}`);

    // Mock calling the email verification API
    // In a real app, you would use your actual email service
    console.log(`Sending verification email to ${email} using API key: ${API_KEY}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification email sent',
        // The following would NOT be included in a production app
        // It's only here for demonstration purposes
        debug: {
          token,
          verificationUrl,
        }
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
    console.error('Error in verify-email function:', error);
    
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
