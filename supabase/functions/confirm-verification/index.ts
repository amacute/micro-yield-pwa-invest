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

// Create rate limiter: 3 requests per IP per minute
const rateLimiter = new RateLimiter({
  requests: 3,
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
          message: 'Too many verification attempts. Please try again later.' 
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
    const { token, email } = await req.json();

    if (!token || !email) {
      return new Response(
        JSON.stringify({ success: false, message: 'Token and email are required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Begin transaction
    const { data: verificationData, error: verificationError } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .is('used_at', null)
      .single();

    if (verificationError || !verificationData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid or expired verification token' 
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Check if token is expired
    if (new Date(verificationData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Verification token has expired' 
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Mark token as used
    const { error: updateTokenError } = await supabase
      .from('email_verification_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', verificationData.id);

    if (updateTokenError) {
      throw updateTokenError;
    }

    // Update user verification status
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('email', email);

    if (updateUserError) {
      throw updateUserError;
    }

    // Process referral bonus if user was referred
    const { data: userData } = await supabase
      .from('users')
      .select('user_id, referred_by')
      .eq('email', email)
      .single();

    if (userData?.referred_by) {
      const { data: referral } = await supabase
        .from('referrals')
        .select('*')
        .eq('referee_id', userData.user_id)
        .eq('status', 'pending')
        .single();

      if (referral) {
        await supabase.rpc('process_referral_bonus', {
          p_referral_id: referral.id,
          p_bonus_amount: 10 // Default bonus amount
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email successfully verified' 
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
    console.error('Error in confirm-verification function:', error);
    
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
