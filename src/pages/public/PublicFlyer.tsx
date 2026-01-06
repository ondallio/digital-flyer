import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircle, User, X } from 'lucide-react';
import { vendorRepository, productRepository, flyerViewsRepository } from '../../lib/unified-storage';
import { formatPrice, formatDiscountRate } from '../../lib/price';
import type { Vendor, Product } from '../../types';

export default function PublicFlyer() {
  const { slug } = useParams<{ slug: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (slug) {
      loadFlyer();
    }
  }, [slug]);

  const loadFlyer = async () => {
    if (!slug) return;
    try {
      const v = await vendorRepository.getBySlug(slug);
      if (v) {
        // Check if vendor is active
        if (v.status !== 'active') {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setVendor(v);
        const prods = await productRepository.getByVendorId(v.id);
        setProducts(prods);
        
        // 조회수 기록
        flyerViewsRepository.recordView(v.id).catch(console.error);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Failed to load flyer:', error);
      setNotFound(true);
    }
    setLoading(false);
  };

  const openKakao = () => {
    if (vendor?.kakaoUrl) {
      window.open(vendor.kakaoUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="mobile-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-300 border-t-primary-900 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-primary-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mobile-container flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="text-6xl mb-4">📄</div>
        <h1 className="text-xl font-semibold mb-2">전단지를 찾을 수 없습니다</h1>
        <p className="text-primary-500">
          존재하지 않거나 비공개된 전단지입니다.
        </p>
      </div>
    );
  }

  if (!vendor) {
    return null;
  }

  // Coming Soon state - no products yet
  const isComingSoon = products.length === 0;

  return (
    <div className="mobile-container min-h-screen bg-white">
      {/* Header with Manager Info */}
      <header className="relative bg-gradient-to-b from-primary-900 to-primary-800 text-white pt-8 pb-12 px-6">
        <div className="text-center">
          {/* Manager Photo */}
          <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white/20 bg-primary-700">
            {vendor.managerPhoto ? (
              <img
                src={vendor.managerPhoto}
                alt={vendor.managerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={40} className="text-primary-400" />
              </div>
            )}
          </div>
          
          <h1 className="text-xl font-bold mb-1">{vendor.shopName}</h1>
          <p className="text-primary-300">{vendor.managerName}</p>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-white rounded-t-[50%]" />
      </header>

      {/* KakaoTalk CTA */}
      <div className="px-4 -mt-3 relative z-10">
        <button
          onClick={openKakao}
          className="btn btn-kakao w-full py-4 text-base font-semibold shadow-lg"
        >
          <MessageCircle size={20} />
          카카오톡으로 문의하기
        </button>
      </div>

      {/* Content */}
      <main className="p-4 pb-8">
        {isComingSoon ? (
          /* Coming Soon State */
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🛍️</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">전단지 준비중</h2>
            <p className="text-primary-500">
              곧 새로운 상품 정보가 업데이트됩니다.
              <br />
              잠시만 기다려주세요!
            </p>
            <button
              onClick={openKakao}
              className="btn btn-outline mt-6"
            >
              <MessageCircle size={18} />
              먼저 문의하기
            </button>
          </div>
        ) : (
          /* Products Grid */
          <>
            <h2 className="font-semibold text-lg mb-4">
              이번 주 추천 상품 <span className="text-primary-400">({products.length})</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {/* Sort: featured first, then by sortOrder */}
              {[...products]
                .sort((a, b) => {
                  if (a.isFeatured && !b.isFeatured) return -1;
                  if (!a.isFeatured && b.isFeatured) return 1;
                  return a.sortOrder - b.sortOrder;
                })
                .map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`card overflow-hidden text-left hover:shadow-md transition-shadow ${
                    product.isFeatured ? 'ring-2 ring-primary-900' : ''
                  }`}
                >
                  <div className="relative aspect-square bg-primary-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-300">
                        <span className="text-4xl">👗</span>
                      </div>
                    )}
                    {product.discountRate > 0 && (
                      <span className="absolute top-2 left-2 badge badge-sale">
                        {formatDiscountRate(product.discountRate)} OFF
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="absolute top-2 right-2 bg-primary-900 text-white text-xs px-2 py-0.5 rounded">
                        추천
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm truncate mb-1">{product.name}</p>
                    <div className="flex items-baseline gap-2">
                      {product.discountRate > 0 && (
                        <span className="text-xs text-primary-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-lg">{formatPrice(product.salePrice)}</p>
                    {/* Sale Period */}
                    {(product.saleStartDate || product.saleEndDate) && (
                      <p className="text-xs text-primary-400 mt-1">
                        {product.saleStartDate && product.saleEndDate
                          ? `${product.saleStartDate} ~ ${product.saleEndDate}`
                          : product.saleEndDate
                          ? `~${product.saleEndDate}까지`
                          : `${product.saleStartDate}~`
                        }
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onKakao={openKakao}
        />
      )}
    </div>
  );
}

// Product Detail Modal Component
function ProductModal({
  product,
  onClose,
  onKakao,
}: {
  product: Product;
  onClose: () => void;
  onKakao: () => void;
}) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full z-10"
        >
          <X size={20} />
        </button>

        {/* Image */}
        <div className="relative aspect-square bg-primary-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-300">
              <span className="text-6xl">👗</span>
            </div>
          )}
          {product.discountRate > 0 && (
            <span className="absolute top-4 left-4 badge badge-sale text-base px-3 py-1">
              {formatDiscountRate(product.discountRate)} OFF
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold">{product.name}</h2>

          <div className="space-y-1">
            {product.discountRate > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-primary-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-red-500 font-medium">
                  {formatDiscountRate(product.discountRate)} 할인
                </span>
              </div>
            )}
            <p className="text-2xl font-bold">{formatPrice(product.salePrice)}</p>
          </div>

          <button
            onClick={onKakao}
            className="btn btn-kakao w-full py-4 text-base font-semibold"
          >
            <MessageCircle size={20} />
            카카오톡으로 문의하기
          </button>
        </div>
      </div>
    </div>
  );
}
