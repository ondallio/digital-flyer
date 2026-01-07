/**
 * Unified Storage API
 * Uses Supabase when configured, falls back to localStorage
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { 
  requestRepository as localRequests,
  vendorRepository as localVendors,
  productRepository as localProducts,
  ticketRepository as localTickets,
  approvalService as localApproval,
  seedDemoData as localSeedDemo,
} from './storage';
import { generateSlug, generateEditToken } from './slug';
import { calculateSalePrice } from './price';
import type { Request, Vendor, Product, Ticket } from '../types';

// Type conversion helpers (snake_case <-> camelCase)
function toVendor(row: any): Vendor {
  return {
    id: row.id,
    slug: row.slug,
    editToken: row.edit_token,
    shopName: row.shop_name,
    managerName: row.manager_name,
    managerPhoto: row.manager_photo,
    kakaoUrl: row.kakao_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function extractKakaoUrl(memo: string | null): string {
  if (!memo) return '';
  // 카카오톡 오픈채팅 URL 패턴 찾기
  const kakaoPattern = /https?:\/\/open\.kakao\.com\/[^\s]+/i;
  const match = memo.match(kakaoPattern);
  return match ? match[0] : '';
}

function toRequest(row: any): Request {
  const memo = row.memo || '';
  return {
    id: row.id,
    shopName: row.shop_name,
    managerName: row.manager_name,
    phone: row.contact,
    kakaoUrl: extractKakaoUrl(memo),
    notes: memo,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toProduct(row: any): Product {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    name: row.name,
    image: row.image || '',
    originalPrice: row.original_price,
    discountRate: row.discount_rate,
    salePrice: row.sale_price,
    sortOrder: row.sort_order || 0,
    saleStartDate: row.sale_start_date || undefined,
    saleEndDate: row.sale_end_date || undefined,
    isFeatured: row.is_featured || false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toTicket(row: any): Ticket {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    subject: row.subject,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==================== Unified Request Repository ====================
export const requestRepository = {
  async getAll(): Promise<Request[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return localRequests.getAll();
    }
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(toRequest);
  },

  async getByStatus(status: string): Promise<Request[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return localRequests.getByStatus(status as Request['status']);
    }
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(toRequest);
  },

  async getById(id: string): Promise<Request | undefined> {
    if (!isSupabaseConfigured() || !supabase) {
      return localRequests.getById(id);
    }
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return undefined;
    return toRequest(data);
  },

  async updateStatus(id: string, status: string): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      localRequests.update(id, { status: status as Request['status'] });
      return;
    }
    await supabase.from('requests').update({ status }).eq('id', id);
  },
};

// ==================== Unified Vendor Repository ====================
export const vendorRepository = {
  async getAll(): Promise<Vendor[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return localVendors.getAll();
    }
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(toVendor);
  },

  async getById(id: string): Promise<Vendor | undefined> {
    if (!isSupabaseConfigured() || !supabase) {
      return localVendors.getById(id);
    }
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return undefined;
    return toVendor(data);
  },

  async getBySlug(slug: string): Promise<Vendor | undefined> {
    if (!isSupabaseConfigured() || !supabase) {
      return localVendors.getBySlug(slug);
    }
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();
    if (error) return undefined;
    return toVendor(data);
  },

  async getByEditToken(token: string): Promise<Vendor | undefined> {
    if (!isSupabaseConfigured() || !supabase) {
      return localVendors.getByEditToken(token);
    }
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('edit_token', token)
      .single();
    if (error) return undefined;
    return toVendor(data);
  },

  async update(id: string, updates: Partial<Vendor>): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      localVendors.update(id, updates);
      return;
    }
    const dbUpdates: Record<string, any> = {};
    if (updates.shopName !== undefined) dbUpdates.shop_name = updates.shopName;
    if (updates.managerName !== undefined) dbUpdates.manager_name = updates.managerName;
    if (updates.managerPhoto !== undefined) dbUpdates.manager_photo = updates.managerPhoto;
    if (updates.kakaoUrl !== undefined) dbUpdates.kakao_url = updates.kakaoUrl;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    await supabase.from('vendors').update(dbUpdates).eq('id', id);
  },

  async regenerateEditToken(id: string): Promise<string> {
    const newToken = generateEditToken();
    if (!isSupabaseConfigured() || !supabase) {
      localVendors.regenerateEditToken(id);
      return newToken;
    }
    await supabase.from('vendors').update({ edit_token: newToken }).eq('id', id);
    return newToken;
  },

  async create(data: { shopName: string; managerName: string; kakaoUrl: string }): Promise<Vendor> {
    if (!isSupabaseConfigured() || !supabase) {
      return localVendors.create(data);
    }

    // Generate unique slug
    let slug = generateSlug(data.shopName);
    let suffix = 1;
    
    while (true) {
      const { data: existing } = await supabase
        .from('vendors')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (!existing) break;
      slug = `${generateSlug(data.shopName)}-${suffix}`;
      suffix++;
    }

    const editToken = generateEditToken();

    const { data: vendor, error } = await supabase
      .from('vendors')
      .insert({
        slug,
        edit_token: editToken,
        shop_name: data.shopName,
        manager_name: data.managerName,
        kakao_url: data.kakaoUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return toVendor(vendor);
  },
};

// ==================== Unified Product Repository ====================
export const productRepository = {
  async getByVendorId(vendorId: string): Promise<Product[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return localProducts.getByVendorId(vendorId);
    }
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map(toProduct);
  },

  async bulkSaveForVendor(vendorId: string, products: Array<{
    name: string;
    image: string;
    originalPrice: number;
    discountRate: number;
    salePrice: number;
    sortOrder: number;
    saleStartDate?: string;
    saleEndDate?: string;
    isFeatured?: boolean;
  }>): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      localProducts.bulkSaveForVendor(vendorId, products);
      return;
    }

    // Delete existing products
    await supabase.from('products').delete().eq('vendor_id', vendorId);

    // Insert new products
    if (products.length > 0) {
      const dbProducts = products.map((p, index) => ({
        vendor_id: vendorId,
        name: p.name,
        image: p.image || null,
        original_price: p.originalPrice,
        discount_rate: p.discountRate,
        sale_price: p.salePrice || calculateSalePrice(p.originalPrice, p.discountRate),
        sort_order: index,
        sale_start_date: p.saleStartDate || null,
        sale_end_date: p.saleEndDate || null,
        is_featured: p.isFeatured || false,
      }));

      await supabase.from('products').insert(dbProducts);
    }
  },
};

// ==================== Unified Ticket Repository ====================
export const ticketRepository = {
  async getAll(): Promise<Ticket[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return localTickets.getAll();
    }
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(toTicket);
  },

  async getByStatus(status: string): Promise<Ticket[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return localTickets.getByStatus(status as Ticket['status']);
    }
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(toTicket);
  },

  async updateStatus(id: string, status: string): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      localTickets.update(id, { status: status as Ticket['status'] });
      return;
    }
    await supabase.from('tickets').update({ status }).eq('id', id);
  },
};

// ==================== Approval Service ====================
export const approvalService = {
  async approveRequest(requestId: string): Promise<{ vendor: Vendor; editUrl: string; publicUrl: string } | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return localApproval.approveRequest(requestId);
    }

    const request = await requestRepository.getById(requestId);
    if (!request || request.status !== 'pending') {
      return null;
    }

    // Update request status
    await requestRepository.updateStatus(requestId, 'approved');

    // Create vendor
    const vendor = await vendorRepository.create({
      shopName: request.shopName,
      managerName: request.managerName,
      kakaoUrl: request.kakaoUrl || '',
    });

    return {
      vendor,
      editUrl: `/edit/${vendor.editToken}`,
      publicUrl: `/s/${vendor.slug}`,
    };
  },

  async rejectRequest(requestId: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
      return localApproval.rejectRequest(requestId);
    }

    const request = await requestRepository.getById(requestId);
    if (!request || request.status !== 'pending') {
      return false;
    }

    await requestRepository.updateStatus(requestId, 'rejected');
    return true;
  },
};

// ==================== Flyer Views Repository ====================
export const flyerViewsRepository = {
  async recordView(vendorId: string): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      // localStorage fallback - simple counter
      const key = `flyer_views_${vendorId}`;
      const count = parseInt(localStorage.getItem(key) || '0', 10);
      localStorage.setItem(key, String(count + 1));
      return;
    }

    await supabase.from('flyer_views').insert({
      vendor_id: vendorId,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    });
  },

  async getViewCount(vendorId: string): Promise<number> {
    if (!isSupabaseConfigured() || !supabase) {
      const key = `flyer_views_${vendorId}`;
      return parseInt(localStorage.getItem(key) || '0', 10);
    }

    const { count, error } = await supabase
      .from('flyer_views')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId);

    if (error) return 0;
    return count || 0;
  },

  async getViewStats(vendorId: string, days: number = 7): Promise<{ date: string; count: number }[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return [];
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('flyer_views')
      .select('viewed_at')
      .eq('vendor_id', vendorId)
      .gte('viewed_at', startDate.toISOString());

    if (error || !data) return [];

    // Group by date
    const grouped = data.reduce((acc: Record<string, number>, view) => {
      const date = new Date(view.viewed_at!).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  },

  async getTotalViewsForAllVendors(): Promise<{ vendorId: string; count: number }[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from('flyer_views')
      .select('vendor_id');

    if (error || !data) return [];

    const grouped = data.reduce((acc: Record<string, number>, view) => {
      acc[view.vendor_id] = (acc[view.vendor_id] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([vendorId, count]) => ({ vendorId, count }));
  },
};

// ==================== Notifications Repository ====================
export const notificationsRepository = {
  async getAll(targetType?: 'admin' | 'vendor', targetId?: string): Promise<any[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return [];
    }

    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (targetType) {
      query = query.eq('target_type', targetType);
    }
    if (targetId) {
      query = query.eq('target_id', targetId);
    }

    const { data, error } = await query;
    if (error) return [];
    return data || [];
  },

  async getUnreadCount(targetType: 'admin' | 'vendor', targetId?: string): Promise<number> {
    if (!isSupabaseConfigured() || !supabase) {
      return 0;
    }

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('target_type', targetType)
      .eq('is_read', false);

    if (targetId) {
      query = query.eq('target_id', targetId);
    }

    const { count, error } = await query;
    if (error) return 0;
    return count || 0;
  },

  async create(notification: {
    type: 'new_request' | 'request_approved' | 'new_ticket' | 'system';
    title: string;
    message?: string;
    targetType?: 'admin' | 'vendor';
    targetId?: string;
  }): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      return;
    }

    await supabase.from('notifications').insert({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      target_type: notification.targetType,
      target_id: notification.targetId,
    });
  },

  async markAsRead(id: string): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      return;
    }

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
  },

  async markAllAsRead(targetType: 'admin' | 'vendor', targetId?: string): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      return;
    }

    let query = supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('target_type', targetType);

    if (targetId) {
      query = query.eq('target_id', targetId);
    }

    await query;
  },
};

// ==================== Seed Demo Data ====================
export function seedDemoData(): void {
  if (!isSupabaseConfigured()) {
    localSeedDemo();
    return;
  }
  // For Supabase, use the dashboard or SQL to seed data
  console.log('Demo data should be seeded via Supabase dashboard or SQL');
}

// Export helper to check if using Supabase
export const isUsingSupabase = isSupabaseConfigured;

