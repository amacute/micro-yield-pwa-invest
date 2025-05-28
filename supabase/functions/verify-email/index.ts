import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { RateLimiter } from "https://deno.land/x/rate_limiter@v0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const API_KEY = Deno.env.get('EMAIL_VERIFICATION_API_KEY') || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !API_KEY) {
  throw new Error('Missing required environment variables');
}

// Create a single supabase client for interacting with your database
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create rate limiter: 5 requests per IP per minute
const rateLimiter = new RateLimiter({
  requests: 5,
  window: 60 * 1000, // 1 minute
});

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    if (!rateLimiter.try(clientIP)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Too many requests. Please try again later.' 
        }),
        { 
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders,
            'Retry-After': '60'
          } 
        }
      );
    }

    // Get the request body
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Valid email is required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Check if email is already verified
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email_verified')
      .eq('email', email)
      .single();

    if (userError) {
      throw userError;
    }

    if (userData?.email_verified) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email is already verified' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Generate a verification token with expiration
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

    // Store verification token in database
    const { error: tokenError } = await supabase
      .from('email_verification_tokens')
      .insert([
        {
          email,
          token,
          expires_at: expiresAt.toISOString()
        }
      ]);

    if (tokenError) {
      throw tokenError;
    }

    // Generate verification URL
    const verificationUrl = `${req.headers.get('origin') || 'https://axiomify.app'}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    // In a production environment, you would send the email here
    // For development, we'll just return the verification URL
    const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development';

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification email sent',
        ...(isDevelopment && { debug: { token, verificationUrl } })
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
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
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
