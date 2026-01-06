import { supabase, isSupabaseConfigured } from './supabase';
import type { 
  Request, 
  Vendor, 
  Product, 
  Ticket, 
  TicketMessage,
  TablesInsert,
  TablesUpdate 
} from '../types/database';
import { generateSlug, generateEditToken } from './slug';

// ============================================
// Request Repository (신청 관리)
// ============================================
export const requestRepositorySupabase = {
  async getAll(): Promise<Request[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getByStatus(status: string): Promise<Request[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(request: TablesInsert<'requests'>): Promise<Request | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('requests')
      .insert(request)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  async approve(id: string, shopName: string, managerName: string, kakaoUrl: string): Promise<Vendor | null> {
    if (!supabase) return null;

    // Generate unique slug
    let slug = generateSlug(shopName);
    let suffix = 1;
    
    // Check for duplicates and append number if needed
    while (true) {
      const { data: existing } = await supabase
        .from('vendors')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (!existing) break;
      slug = `${generateSlug(shopName)}-${suffix}`;
      suffix++;
    }

    const editToken = generateEditToken();

    // Create vendor
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .insert({
        slug,
        edit_token: editToken,
        shop_name: shopName,
        manager_name: managerName,
        kakao_url: kakaoUrl,
      })
      .select()
      .single();

    if (vendorError) throw vendorError;

    // Update request status
    await this.updateStatus(id, 'approved');

    return vendor;
  },
};

// ============================================
// Vendor Repository (거래처 관리)
// ============================================
export const vendorRepositorySupabase = {
  async getAll(): Promise<Vendor[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Vendor | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  async getBySlug(slug: string): Promise<Vendor | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();
    if (error) return null;
    return data;
  },

  async getByEditToken(token: string): Promise<Vendor | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('edit_token', token)
      .single();
    if (error) return null;
    return data;
  },

  async update(id: string, updates: TablesUpdate<'vendors'>): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async regenerateEditToken(id: string): Promise<string> {
    if (!supabase) return '';
    const newToken = generateEditToken();
    const { error } = await supabase
      .from('vendors')
      .update({ edit_token: newToken })
      .eq('id', id);
    if (error) throw error;
    return newToken;
  },

  async setStatus(id: string, status: 'active' | 'hidden' | 'blocked'): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from('vendors')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================
// Product Repository (상품 관리)
// ============================================
export const productRepositorySupabase = {
  async getByVendorId(vendorId: string): Promise<Product[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async bulkSaveForVendor(vendorId: string, products: Omit<TablesInsert<'products'>, 'vendor_id'>[]): Promise<void> {
    if (!supabase) return;

    // Delete existing products
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('vendor_id', vendorId);
    if (deleteError) throw deleteError;

    // Insert new products
    if (products.length > 0) {
      const productsWithVendor = products.map((p, index) => ({
        ...p,
        vendor_id: vendorId,
        sort_order: index,
      }));

      const { error: insertError } = await supabase
        .from('products')
        .insert(productsWithVendor);
      if (insertError) throw insertError;
    }
  },
};

// ============================================
// Ticket Repository (문의 관리)
// ============================================
export const ticketRepositorySupabase = {
  async getAll(): Promise<Ticket[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getByVendorId(vendorId: string): Promise<Ticket[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Ticket | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  async create(ticket: TablesInsert<'tickets'>): Promise<Ticket | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('tickets')
      .insert(ticket)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  async getMessages(ticketId: string): Promise<TicketMessage[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addMessage(message: TablesInsert<'ticket_messages'>): Promise<TicketMessage | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert(message)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============================================
// Export unified interface
// ============================================
export const supabaseRepositories = {
  requests: requestRepositorySupabase,
  vendors: vendorRepositorySupabase,
  products: productRepositorySupabase,
  tickets: ticketRepositorySupabase,
  isConfigured: isSupabaseConfigured,
};

