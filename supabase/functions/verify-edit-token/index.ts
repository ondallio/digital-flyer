// Edge Function: Verify Edit Token
// This function verifies the edit token and returns vendor data or signed upload URLs

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { editToken, action } = await req.json();

    if (!editToken) {
      return new Response(
        JSON.stringify({ error: 'Edit token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Hash the token for comparison (in production, use proper hashing)
    const tokenHash = await hashToken(editToken);

    // Find vendor by token hash
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('edit_token_hash', tokenHash)
      .single();

    if (vendorError || !vendor) {
      return new Response(
        JSON.stringify({ error: 'Invalid edit token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Get vendor data
    if (action === 'get') {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('sort_order');

      return new Response(
        JSON.stringify({ vendor, products }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Get signed upload URL
    if (action === 'upload') {
      const { path, contentType } = await req.json();
      
      const { data: signedUrl, error: uploadError } = await supabase.storage
        .from('flyers')
        .createSignedUploadUrl(`vendors/${vendor.id}/${path}`);

      if (uploadError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create upload URL' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ signedUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Save vendor data
    if (action === 'save') {
      const { vendorData, productsData } = await req.json();

      // Update vendor
      const { error: updateError } = await supabase
        .from('vendors')
        .update({
          shop_name: vendorData.shopName,
          manager_name: vendorData.managerName,
          manager_photo_path: vendorData.managerPhotoPath,
          kakao_url: vendorData.kakaoUrl,
        })
        .eq('id', vendor.id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update vendor' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete existing products and insert new ones
      await supabase.from('products').delete().eq('vendor_id', vendor.id);

      if (productsData && productsData.length > 0) {
        const { error: productsError } = await supabase
          .from('products')
          .insert(
            productsData.map((p: any, index: number) => ({
              vendor_id: vendor.id,
              name: p.name,
              image_path: p.imagePath,
              original_price: p.originalPrice,
              discount_rate: p.discountRate,
              sale_price: p.salePrice,
              sort_order: index,
            }))
          );

        if (productsError) {
          return new Response(
            JSON.stringify({ error: 'Failed to save products' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Simple hash function (use bcrypt or similar in production)
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

