// Edge Function: Approve Request
// This function handles admin approval of vendor requests

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { requestId, adminKey } = await req.json();

    // Simple admin key check (use proper auth in production)
    const expectedAdminKey = Deno.env.get('ADMIN_SECRET_KEY');
    if (adminKey !== expectedAdminKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'pending')
      .single();

    if (requestError || !request) {
      return new Response(
        JSON.stringify({ error: 'Request not found or already processed' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate slug and edit token
    const slug = generateSlug(request.shop_name);
    const editToken = generateToken(32);
    const editTokenHash = await hashToken(editToken);

    // Check slug uniqueness
    const { data: existingVendor } = await supabase
      .from('vendors')
      .select('slug')
      .eq('slug', slug)
      .single();

    const finalSlug = existingVendor ? `${slug}-${Date.now()}` : slug;

    // Create vendor
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .insert({
        slug: finalSlug,
        shop_name: request.shop_name,
        manager_name: request.manager_name,
        kakao_url: request.kakao_url || '',
        edit_token_hash: editTokenHash,
      })
      .select()
      .single();

    if (vendorError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create vendor' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update request status
    await supabase
      .from('requests')
      .update({ status: 'approved' })
      .eq('id', requestId);

    // Return the edit token (only returned once, never stored in plain text)
    const baseUrl = Deno.env.get('PUBLIC_URL') || 'https://your-domain.com';
    
    return new Response(
      JSON.stringify({
        vendor,
        editToken, // Plain token for admin to send to vendor
        editUrl: `${baseUrl}/edit/${editToken}`,
        publicUrl: `${baseUrl}/s/${finalSlug}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateSlug(shopName: string): string {
  return shopName
    .toLowerCase()
    .replace(/[가-힣]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || generateToken(8);
}

function generateToken(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

