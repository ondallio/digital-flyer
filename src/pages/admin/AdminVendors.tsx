import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, EyeOff, Ban, ExternalLink } from 'lucide-react';
import { vendorRepository, productRepository } from '../../lib/unified-storage';
import type { Vendor, VendorStatus } from '../../types';

type TabType = 'all' | VendorStatus;

export default function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchQuery, activeTab]);

  const loadVendors = async () => {
    const data = await vendorRepository.getAll();
    setVendors(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    // Count products per vendor
    const counts: Record<string, number> = {};
    for (const v of data) {
      const products = await productRepository.getByVendorId(v.id);
      counts[v.id] = products.length;
    }
    setProductCounts(counts);
  };

  const filterVendors = () => {
    let filtered = [...vendors];

    if (activeTab !== 'all') {
      filtered = filtered.filter((v) => v.status === activeTab);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.shopName.toLowerCase().includes(query) ||
          v.managerName.toLowerCase().includes(query) ||
          v.slug.toLowerCase().includes(query)
      );
    }

    setFilteredVendors(filtered);
  };

  const handleStatusChange = async (vendorId: string, newStatus: VendorStatus) => {
    await vendorRepository.update(vendorId, { status: newStatus });
    loadVendors();
  };

  const getStatusBadge = (status: VendorStatus) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      hidden: 'bg-yellow-100 text-yellow-700',
      blocked: 'bg-red-100 text-red-700',
    };
    const labels = {
      active: '활성',
      hidden: '숨김',
      blocked: '차단',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: '전체', count: vendors.length },
    { key: 'active', label: '활성', count: vendors.filter((v) => v.status === 'active').length },
    { key: 'hidden', label: '숨김', count: vendors.filter((v) => v.status === 'hidden').length },
    { key: 'blocked', label: '차단', count: vendors.filter((v) => v.status === 'blocked').length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">거래처 관리</h1>
        <p className="text-primary-500 mt-1">등록된 거래처를 관리하세요</p>
      </div>

      {/* Search & Tabs */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
          <input
            type="text"
            placeholder="매장명, 담당자, slug 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-900 text-white'
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Vendor List */}
      <div className="card divide-y divide-primary-100">
        {filteredVendors.length === 0 ? (
          <div className="p-8 text-center text-primary-400">
            {searchQuery ? '검색 결과가 없습니다' : '등록된 거래처가 없습니다'}
          </div>
        ) : (
          filteredVendors.map((vendor) => (
            <div key={vendor.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      to={`/admin/vendors/${vendor.id}`}
                      className="font-semibold truncate hover:underline"
                    >
                      {vendor.shopName}
                    </Link>
                    {getStatusBadge(vendor.status)}
                    {productCounts[vendor.id] === 0 && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        상품 없음
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-primary-500">{vendor.managerName}</p>
                  <p className="text-sm text-primary-400 font-mono">/s/{vendor.slug}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-primary-400">
                    <span>상품 {productCounts[vendor.id]}개</span>
                    <span>{new Date(vendor.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`/s/${vendor.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors"
                    title="전단지 보기"
                  >
                    <ExternalLink size={18} />
                  </a>
                  {vendor.status === 'active' && (
                    <button
                      onClick={() => handleStatusChange(vendor.id, 'hidden')}
                      className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                      title="숨기기"
                    >
                      <EyeOff size={18} />
                    </button>
                  )}
                  {vendor.status === 'hidden' && (
                    <button
                      onClick={() => handleStatusChange(vendor.id, 'active')}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="활성화"
                    >
                      <Eye size={18} />
                    </button>
                  )}
                  {vendor.status !== 'blocked' && (
                    <button
                      onClick={() => {
                        if (confirm('이 거래처를 차단하시겠습니까?')) {
                          handleStatusChange(vendor.id, 'blocked');
                        }
                      }}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="차단"
                    >
                      <Ban size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

