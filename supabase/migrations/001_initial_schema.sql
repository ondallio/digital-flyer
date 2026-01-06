-- Digital Flyer Initial Schema
-- Run this migration after creating a Supabase project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== REQUESTS ====================
-- Google Form submissions (pending approval)
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_name TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  phone TEXT,
  kakao_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for status filtering
CREATE INDEX idx_requests_status ON requests(status);

-- ==================== VENDORS ====================
-- Approved vendors with flyer pages
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  shop_name TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  manager_photo_path TEXT,
  kakao_url TEXT NOT NULL,
  edit_token_hash TEXT NOT NULL, -- Store hashed token for security
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for slug lookup (public page)
CREATE INDEX idx_vendors_slug ON vendors(slug);

-- ==================== PRODUCTS ====================
-- Products for each vendor (max 6)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_path TEXT,
  original_price INTEGER NOT NULL,
  discount_rate INTEGER NOT NULL DEFAULT 0,
  sale_price INTEGER NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vendor product lookup
CREATE INDEX idx_products_vendor ON products(vendor_id);

-- ==================== TICKETS ====================
-- Support tickets between admin and vendors
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tickets_vendor ON tickets(vendor_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- ==================== TICKET MESSAGES ====================
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author TEXT NOT NULL CHECK (author IN ('vendor', 'admin')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- ==================== ROW LEVEL SECURITY ====================
-- Enable RLS
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Public read access to active vendors and their products
CREATE POLICY "Public can view active vendors" ON vendors
  FOR SELECT USING (status = 'active');

CREATE POLICY "Public can view products of active vendors" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = products.vendor_id AND vendors.status = 'active'
    )
  );

-- Admin has full access (use service role key or custom admin check)
-- These policies would be used with authenticated admin users
-- For MVP, use service role key in Edge Functions

-- ==================== UPDATED_AT TRIGGER ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

