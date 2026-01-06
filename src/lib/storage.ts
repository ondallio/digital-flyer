import type { Request, Vendor, Product, Ticket, TicketMessage } from '../types';
import { generateSlug, resolveSlugConflict, generateEditToken } from './slug';

// Storage Keys
const STORAGE_KEYS = {
  REQUESTS: 'flyer_requests',
  VENDORS: 'flyer_vendors',
  PRODUCTS: 'flyer_products',
  TICKETS: 'flyer_tickets',
  TICKET_MESSAGES: 'flyer_ticket_messages',
} as const;

// Helper: Generate UUID
function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

// Helper: Get current ISO timestamp
function now(): string {
  return new Date().toISOString();
}

// Generic localStorage helpers
function getItems<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setItems<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

// ==================== Requests ====================
export const requestRepository = {
  getAll(): Request[] {
    return getItems<Request>(STORAGE_KEYS.REQUESTS);
  },

  getById(id: string): Request | undefined {
    return this.getAll().find((r) => r.id === id);
  },

  getByStatus(status: Request['status']): Request[] {
    return this.getAll().filter((r) => r.status === status);
  },

  create(data: Omit<Request, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Request {
    const request: Request = {
      ...data,
      id: generateId(),
      status: 'pending',
      createdAt: now(),
      updatedAt: now(),
    };
    const items = this.getAll();
    items.push(request);
    setItems(STORAGE_KEYS.REQUESTS, items);
    return request;
  },

  update(id: string, data: Partial<Request>): Request | undefined {
    const items = this.getAll();
    const index = items.findIndex((r) => r.id === id);
    if (index === -1) return undefined;

    items[index] = { ...items[index], ...data, updatedAt: now() };
    setItems(STORAGE_KEYS.REQUESTS, items);
    return items[index];
  },

  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter((r) => r.id !== id);
    if (filtered.length === items.length) return false;
    setItems(STORAGE_KEYS.REQUESTS, filtered);
    return true;
  },
};

// ==================== Vendors ====================
export const vendorRepository = {
  getAll(): Vendor[] {
    return getItems<Vendor>(STORAGE_KEYS.VENDORS);
  },

  getById(id: string): Vendor | undefined {
    return this.getAll().find((v) => v.id === id);
  },

  getBySlug(slug: string): Vendor | undefined {
    return this.getAll().find((v) => v.slug === slug);
  },

  getByEditToken(token: string): Vendor | undefined {
    return this.getAll().find((v) => v.editToken === token);
  },

  getAllSlugs(): string[] {
    return this.getAll().map((v) => v.slug);
  },

  create(data: Omit<Vendor, 'id' | 'slug' | 'editToken' | 'status' | 'createdAt' | 'updatedAt'>): Vendor {
    const existingSlugs = this.getAllSlugs();
    const baseSlug = generateSlug(data.shopName);
    const slug = resolveSlugConflict(baseSlug, existingSlugs);
    const editToken = generateEditToken();

    const vendor: Vendor = {
      ...data,
      id: generateId(),
      slug,
      editToken,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    };

    const items = this.getAll();
    items.push(vendor);
    setItems(STORAGE_KEYS.VENDORS, items);
    return vendor;
  },

  update(id: string, data: Partial<Omit<Vendor, 'id' | 'slug' | 'editToken' | 'createdAt'>>): Vendor | undefined {
    const items = this.getAll();
    const index = items.findIndex((v) => v.id === id);
    if (index === -1) return undefined;

    items[index] = { ...items[index], ...data, updatedAt: now() };
    setItems(STORAGE_KEYS.VENDORS, items);
    return items[index];
  },

  regenerateEditToken(id: string): Vendor | undefined {
    const items = this.getAll();
    const index = items.findIndex((v) => v.id === id);
    if (index === -1) return undefined;

    items[index] = { 
      ...items[index], 
      editToken: generateEditToken(),
      updatedAt: now() 
    };
    setItems(STORAGE_KEYS.VENDORS, items);
    return items[index];
  },

  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter((v) => v.id !== id);
    if (filtered.length === items.length) return false;
    setItems(STORAGE_KEYS.VENDORS, filtered);
    // Also delete related products
    productRepository.deleteByVendorId(id);
    return true;
  },
};

// ==================== Products ====================
export const productRepository = {
  getAll(): Product[] {
    return getItems<Product>(STORAGE_KEYS.PRODUCTS);
  },

  getById(id: string): Product | undefined {
    return this.getAll().find((p) => p.id === id);
  },

  getByVendorId(vendorId: string): Product[] {
    return this.getAll()
      .filter((p) => p.vendorId === vendorId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const product: Product = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    const items = this.getAll();
    items.push(product);
    setItems(STORAGE_KEYS.PRODUCTS, items);
    return product;
  },

  update(id: string, data: Partial<Omit<Product, 'id' | 'vendorId' | 'createdAt'>>): Product | undefined {
    const items = this.getAll();
    const index = items.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    items[index] = { ...items[index], ...data, updatedAt: now() };
    setItems(STORAGE_KEYS.PRODUCTS, items);
    return items[index];
  },

  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter((p) => p.id !== id);
    if (filtered.length === items.length) return false;
    setItems(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  },

  deleteByVendorId(vendorId: string): void {
    const items = this.getAll();
    const filtered = items.filter((p) => p.vendorId !== vendorId);
    setItems(STORAGE_KEYS.PRODUCTS, filtered);
  },

  // Bulk update for reordering or batch save
  bulkSaveForVendor(vendorId: string, products: Omit<Product, 'id' | 'vendorId' | 'createdAt' | 'updatedAt'>[]): Product[] {
    // Delete existing products for this vendor
    this.deleteByVendorId(vendorId);

    // Create new products
    const newProducts: Product[] = products.map((p, index) => ({
      ...p,
      id: generateId(),
      vendorId,
      sortOrder: index,
      createdAt: now(),
      updatedAt: now(),
    }));

    const items = this.getAll();
    items.push(...newProducts);
    setItems(STORAGE_KEYS.PRODUCTS, items);

    return newProducts;
  },
};

// ==================== Tickets ====================
export const ticketRepository = {
  getAll(): Ticket[] {
    return getItems<Ticket>(STORAGE_KEYS.TICKETS);
  },

  getById(id: string): Ticket | undefined {
    return this.getAll().find((t) => t.id === id);
  },

  getByVendorId(vendorId: string): Ticket[] {
    return this.getAll().filter((t) => t.vendorId === vendorId);
  },

  getByStatus(status: Ticket['status']): Ticket[] {
    return this.getAll().filter((t) => t.status === status);
  },

  create(data: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Ticket {
    const ticket: Ticket = {
      ...data,
      id: generateId(),
      status: 'open',
      createdAt: now(),
      updatedAt: now(),
    };
    const items = this.getAll();
    items.push(ticket);
    setItems(STORAGE_KEYS.TICKETS, items);
    return ticket;
  },

  update(id: string, data: Partial<Ticket>): Ticket | undefined {
    const items = this.getAll();
    const index = items.findIndex((t) => t.id === id);
    if (index === -1) return undefined;

    items[index] = { ...items[index], ...data, updatedAt: now() };
    setItems(STORAGE_KEYS.TICKETS, items);
    return items[index];
  },
};

// ==================== Ticket Messages ====================
export const ticketMessageRepository = {
  getAll(): TicketMessage[] {
    return getItems<TicketMessage>(STORAGE_KEYS.TICKET_MESSAGES);
  },

  getByTicketId(ticketId: string): TicketMessage[] {
    return this.getAll()
      .filter((m) => m.ticketId === ticketId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  create(data: Omit<TicketMessage, 'id' | 'createdAt'>): TicketMessage {
    const message: TicketMessage = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };
    const items = this.getAll();
    items.push(message);
    setItems(STORAGE_KEYS.TICKET_MESSAGES, items);
    return message;
  },
};

// ==================== Approval Service ====================
export const approvalService = {
  /**
   * 신청 승인: Request를 approved로 변경하고 Vendor를 생성
   */
  approveRequest(requestId: string): { vendor: Vendor; editUrl: string; publicUrl: string } | null {
    const request = requestRepository.getById(requestId);
    if (!request || request.status !== 'pending') {
      return null;
    }

    // Update request status
    requestRepository.update(requestId, { status: 'approved' });

    // Create vendor
    const vendor = vendorRepository.create({
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

  /**
   * 신청 반려
   */
  rejectRequest(requestId: string): boolean {
    const request = requestRepository.getById(requestId);
    if (!request || request.status !== 'pending') {
      return false;
    }

    requestRepository.update(requestId, { status: 'rejected' });
    return true;
  },
};

// ==================== Seed Data (for testing) ====================
export function seedDemoData(): void {
  // Clear existing data
  localStorage.removeItem(STORAGE_KEYS.REQUESTS);
  localStorage.removeItem(STORAGE_KEYS.VENDORS);
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);

  // Create sample requests
  requestRepository.create({
    shopName: '롯데백화점 본점',
    managerName: '김민수',
    phone: '010-1234-5678',
    kakaoUrl: 'https://open.kakao.com/o/sample1',
    notes: '2층 여성복 매장입니다.',
  });

  requestRepository.create({
    shopName: '신세계 강남점',
    managerName: '이지은',
    phone: '010-9876-5432',
    kakaoUrl: 'https://open.kakao.com/o/sample2',
  });

  requestRepository.create({
    shopName: '현대백화점 판교점',
    managerName: '박서준',
    phone: '010-5555-6666',
    kakaoUrl: 'https://open.kakao.com/o/sample3',
    notes: '잡화 코너 매장',
  });
}

