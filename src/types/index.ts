// 신청 상태
export type RequestStatus = 'pending' | 'approved' | 'rejected';

// 거래처 상태
export type VendorStatus = 'active' | 'hidden' | 'blocked';

// 신청 (구글폼에서 들어온 데이터)
export interface Request {
  id: string;
  shopName: string;
  managerName: string;
  phone?: string;
  kakaoUrl?: string;
  notes?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

// 거래처 (승인 후 생성)
export interface Vendor {
  id: string;
  slug: string;
  shopName: string;
  managerName: string;
  managerPhoto?: string; // base64 or URL
  kakaoUrl: string;
  editToken: string;
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
}

// 상품
export interface Product {
  id: string;
  vendorId: string;
  name: string;
  image?: string; // base64 or URL
  originalPrice: number;
  discountRate: number;
  salePrice: number;
  sortOrder: number;
  saleStartDate?: string; // 세일 시작일
  saleEndDate?: string; // 세일 종료일
  isFeatured?: boolean; // 메인 노출 여부
  createdAt: string;
  updatedAt: string;
}

// 조회수 통계
export interface FlyerView {
  id: string;
  vendorId: string;
  viewedAt: string;
  userAgent?: string;
  referrer?: string;
  ipHash?: string;
}

// 알림
export interface Notification {
  id: string;
  type: 'new_request' | 'request_approved' | 'new_ticket' | 'system';
  title: string;
  message?: string;
  targetType?: 'admin' | 'vendor';
  targetId?: string;
  isRead: boolean;
  createdAt: string;
}

// 문의 티켓
export interface Ticket {
  id: string;
  vendorId: string;
  subject: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  updatedAt: string;
}

// 문의 메시지
export interface TicketMessage {
  id: string;
  ticketId: string;
  author: 'vendor' | 'admin';
  message: string;
  createdAt: string;
}

// 폼 데이터 타입
export interface ProductFormData {
  name: string;
  image?: string;
  originalPrice: number;
  discountRate: number;
  saleStartDate?: string;
  saleEndDate?: string;
  isFeatured?: boolean;
}

export interface VendorFormData {
  shopName: string;
  managerName: string;
  managerPhoto?: string;
  kakaoUrl: string;
  products: ProductFormData[];
}

