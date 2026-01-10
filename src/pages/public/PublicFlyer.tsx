import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircle, User } from 'lucide-react';
import { useVendorBySlug } from '../../hooks';
import { flyerViewsRepository } from '../../lib/unified-storage';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ProductCard } from '../../components/product/ProductCard';
import { ProductDetailModal } from '../../components/product/ProductDetailModal';
import type { Product } from '../../types';

export default function PublicFlyer() {
  const { slug } = useParams<{ slug: string }>();
  const { vendor, products, loading, notFound } = useVendorBySlug(slug);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Record view on mount
  useEffect(() => {
    if (vendor?.id) {
      flyerViewsRepository.recordView(vendor.id).catch(console.error);
    }
  }, [vendor?.id]);

  const openKakao = useCallback(() => {
    if (vendor?.kakaoUrl) {
      window.open(vendor.kakaoUrl, '_blank');
    }
  }, [vendor?.kakaoUrl]);

  if (loading) {
    return <LoadingSpinner fullScreen message="로딩 중..." />;
  }

  if (notFound || !vendor) {
    return (
      <div className="mobile-container flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="text-6xl mb-4">📄</div>
        <h1 className="text-xl font-semibold mb-2">전단지를 찾을 수 없습니다</h1>
        <p className="text-primary-500">존재하지 않거나 비공개된 전단지입니다.</p>
      </div>
    );
  }

  const isComingSoon = products.length === 0;
  const sortedProducts = [...products].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return a.sortOrder - b.sortOrder;
  });

  return (
    <div className="mobile-container min-h-screen bg-white">
      {/* Header with Manager Info */}
      <header className="relative bg-gradient-to-b from-primary-900 to-primary-800 text-white pt-8 pb-12 px-6">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white/20 bg-primary-700">
            {vendor.managerPhoto ? (
              <img
                src={vendor.managerPhoto}
                alt={vendor.managerName}
                className="w-full h-full object-cover"
                loading="lazy"
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
            <button onClick={openKakao} className="btn btn-outline mt-6">
              <MessageCircle size={18} />
              먼저 문의하기
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-semibold text-lg mb-4">
              이번 주 추천 상품 <span className="text-primary-400">({products.length})</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onKakao={openKakao}
      />
    </div>
  );
}
