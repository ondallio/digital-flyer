import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Store, MessageSquare, AlertCircle, ArrowRight } from 'lucide-react';
import { 
  requestRepository, 
  vendorRepository, 
  ticketRepository, 
  productRepository,
  seedDemoData,
  isUsingSupabase 
} from '../../lib/unified-storage';
import type { Request, Vendor } from '../../types';

interface Stats {
  pendingRequests: number;
  totalVendors: number;
  activeVendors: number;
  openTickets: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    pendingRequests: 0,
    totalVendors: 0,
    activeVendors: 0,
    openTickets: 0,
  });
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);
  const [incompleteVendors, setIncompleteVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [requests, vendors, tickets] = await Promise.all([
        requestRepository.getAll(),
        vendorRepository.getAll(),
        ticketRepository.getAll(),
      ]);

      setStats({
        pendingRequests: requests.filter((r) => r.status === 'pending').length,
        totalVendors: vendors.length,
        activeVendors: vendors.filter((v) => v.status === 'active').length,
        openTickets: tickets.filter((t) => t.status === 'open').length,
      });

      setRecentRequests(
        requests
          .filter((r) => r.status === 'pending')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
      );

      // Find vendors without products (incomplete)
      const activeVendors = vendors.filter((v) => v.status === 'active');
      const vendorsWithProductsPromises = activeVendors.map(async (v) => {
        const products = await productRepository.getByVendorId(v.id);
        return { vendor: v, hasProducts: products.length > 0 };
      });
      
      const vendorProductStatus = await Promise.all(vendorsWithProductsPromises);
      setIncompleteVendors(
        vendorProductStatus
          .filter((vp) => !vp.hasProducts)
          .map((vp) => vp.vendor)
          .slice(0, 5)
      );
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = () => {
    if (isUsingSupabase()) {
      alert('Supabase를 사용 중입니다. 대시보드에서 직접 데이터를 추가하세요.');
      return;
    }
    if (confirm('데모 데이터를 생성하시겠습니까? 기존 데이터가 초기화됩니다.')) {
      seedDemoData();
      loadDashboardData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-primary-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-primary-500 mt-1">전체 현황을 확인하세요</p>
        </div>
        <button onClick={handleSeedData} className="btn btn-outline text-sm">
          데모 데이터 생성
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/requests"
          className="card p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-primary-500">대기 중 신청</p>
              <p className="text-2xl font-bold">{stats.pendingRequests}</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/vendors"
          className="card p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Store className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-primary-500">총 거래처</p>
              <p className="text-2xl font-bold">{stats.totalVendors}</p>
            </div>
          </div>
        </Link>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Store className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-primary-500">활성 거래처</p>
              <p className="text-2xl font-bold">{stats.activeVendors}</p>
            </div>
          </div>
        </div>

        <Link
          to="/admin/tickets"
          className="card p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <MessageSquare className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-primary-500">미응답 문의</p>
              <p className="text-2xl font-bold">{stats.openTickets}</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Pending Requests */}
        <div className="card">
          <div className="p-4 border-b border-primary-200 flex items-center justify-between">
            <h2 className="font-semibold">대기 중인 신청</h2>
            <Link
              to="/admin/requests"
              className="text-sm text-primary-500 hover:text-primary-700 flex items-center gap-1"
            >
              전체보기 <ArrowRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-primary-100">
            {recentRequests.length === 0 ? (
              <div className="p-8 text-center text-primary-400">
                대기 중인 신청이 없습니다
              </div>
            ) : (
              recentRequests.map((request) => (
                <div key={request.id} className="p-4 hover:bg-primary-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{request.shopName}</p>
                      <p className="text-sm text-primary-500">{request.managerName}</p>
                    </div>
                    <span className="text-xs text-primary-400">
                      {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Incomplete Vendors */}
        <div className="card">
          <div className="p-4 border-b border-primary-200 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <AlertCircle size={18} className="text-yellow-500" />
              입력 미완료 거래처
            </h2>
            <Link
              to="/admin/vendors"
              className="text-sm text-primary-500 hover:text-primary-700 flex items-center gap-1"
            >
              전체보기 <ArrowRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-primary-100">
            {incompleteVendors.length === 0 ? (
              <div className="p-8 text-center text-primary-400">
                모든 거래처가 상품을 등록했습니다
              </div>
            ) : (
              incompleteVendors.map((vendor) => (
                <Link
                  key={vendor.id}
                  to={`/admin/vendors/${vendor.id}`}
                  className="p-4 hover:bg-primary-50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{vendor.shopName}</p>
                    <p className="text-sm text-primary-500">{vendor.managerName}</p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                    상품 미등록
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
