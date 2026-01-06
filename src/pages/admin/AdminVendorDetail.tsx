import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Ban,
  Store,
  User,
  MessageCircle,
  Package
} from 'lucide-react';
import { vendorRepository, productRepository } from '../../lib/storage';
import { formatPrice, formatDiscountRate } from '../../lib/price';
import type { Vendor, Product } from '../../types';

export default function AdminVendorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadVendor();
    }
  }, [id]);

  const loadVendor = () => {
    if (!id) return;
    const v = vendorRepository.getById(id);
    if (v) {
      setVendor(v);
      setProducts(productRepository.getByVendorId(id));
    } else {
      navigate('/admin/vendors');
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} 복사됨`);
    } catch {
      showToast('복사 실패');
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const handleRegenerateToken = () => {
    if (!vendor) return;
    if (confirm('편집 토큰을 재발급하시겠습니까?\n기존 링크는 더 이상 사용할 수 없습니다.')) {
      vendorRepository.regenerateEditToken(vendor.id);
      loadVendor();
      showToast('토큰이 재발급되었습니다');
    }
  };

  const handleStatusChange = (newStatus: Vendor['status']) => {
    if (!vendor) return;
    vendorRepository.update(vendor.id, { status: newStatus });
    loadVendor();
    showToast('상태가 변경되었습니다');
  };

  if (!vendor) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-primary-400">로딩 중...</p>
      </div>
    );
  }

  const editUrl = `${window.location.origin}/edit/${vendor.editToken}`;
  const publicUrl = `${window.location.origin}/s/${vendor.slug}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/vendors"
          className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{vendor.shopName}</h1>
          <p className="text-primary-500">{vendor.managerName}</p>
        </div>
        <div className="flex gap-2">
          {vendor.status === 'active' && (
            <button
              onClick={() => handleStatusChange('hidden')}
              className="btn btn-outline"
            >
              <EyeOff size={18} />
              숨기기
            </button>
          )}
          {vendor.status === 'hidden' && (
            <button
              onClick={() => handleStatusChange('active')}
              className="btn btn-outline"
            >
              <Eye size={18} />
              활성화
            </button>
          )}
          {vendor.status !== 'blocked' && (
            <button
              onClick={() => {
                if (confirm('이 거래처를 차단하시겠습니까?')) {
                  handleStatusChange('blocked');
                }
              }}
              className="btn btn-outline text-red-600 border-red-200 hover:bg-red-50"
            >
              <Ban size={18} />
              차단
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Info Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Store size={20} />
              기본 정보
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-primary-500">매장명</label>
                <p className="font-medium">{vendor.shopName}</p>
              </div>
              <div>
                <label className="text-sm text-primary-500">담당자</label>
                <p className="font-medium">{vendor.managerName}</p>
              </div>
              <div>
                <label className="text-sm text-primary-500">상태</label>
                <p>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      vendor.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : vendor.status === 'hidden'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {vendor.status === 'active' ? '활성' : vendor.status === 'hidden' ? '숨김' : '차단'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-primary-500">등록일</label>
                <p className="font-medium">
                  {new Date(vendor.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <MessageCircle size={20} />
              링크 관리
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-primary-500 mb-1 block">
                  고객 전단지 링크
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    className="input text-sm flex-1 font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(publicUrl, '전단지 링크')}
                    className="btn btn-outline px-3"
                  >
                    <Copy size={18} />
                  </button>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline px-3"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>

              <div>
                <label className="text-sm text-primary-500 mb-1 block">
                  매니저 편집 링크
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={editUrl}
                    className="input text-sm flex-1 font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(editUrl, '편집 링크')}
                    className="btn btn-outline px-3"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={handleRegenerateToken}
                    className="btn btn-outline px-3"
                    title="토큰 재발급"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
                <p className="text-xs text-primary-400 mt-1">
                  ⚠️ 토큰 재발급 시 기존 편집 링크는 무효화됩니다
                </p>
              </div>

              {vendor.kakaoUrl && (
                <div>
                  <label className="text-sm text-primary-500 mb-1 block">
                    카카오톡 링크
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={vendor.kakaoUrl}
                      className="input text-sm flex-1"
                    />
                    <a
                      href={vendor.kakaoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-kakao px-3"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Package size={20} />
              등록 상품 ({products.length}/6)
            </h2>

            {products.length === 0 ? (
              <div className="text-center py-8 text-primary-400">
                <Package size={48} className="mx-auto mb-2 opacity-50" />
                <p>등록된 상품이 없습니다</p>
                <p className="text-sm">매니저가 상품을 등록하면 여기에 표시됩니다</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="border border-primary-200 rounded-lg overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-primary-100 flex items-center justify-center">
                        <Package size={32} className="text-primary-300" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-primary-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                        <span className="text-sm text-red-500">
                          {formatDiscountRate(product.discountRate)}
                        </span>
                      </div>
                      <p className="font-bold">{formatPrice(product.salePrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="card p-4 sticky top-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <User size={20} />
              전단지 미리보기
            </h2>
            <div className="border border-primary-200 rounded-lg overflow-hidden">
              <iframe
                src={`/s/${vendor.slug}`}
                className="w-full h-[600px]"
                title="전단지 미리보기"
              />
            </div>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full mt-4"
            >
              <ExternalLink size={18} />
              새 탭에서 보기
            </a>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

