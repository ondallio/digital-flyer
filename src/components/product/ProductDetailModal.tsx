import { MessageCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { LazyImage } from '../LazyImage';
import { formatPrice, formatDiscountRate } from '../../lib/price';
import type { Product } from '../../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onKakao: () => void;
}

export function ProductDetailModal({ product, onClose, onKakao }: ProductDetailModalProps) {
  if (!product) return null;

  return (
    <Modal isOpen={!!product} onClose={onClose}>
      <div className="relative aspect-square bg-primary-100">
        {product.image ? (
          <LazyImage
            src={product.image}
            alt={product.name}
            className="w-full h-full"
            fallback={
              <div className="w-full h-full flex items-center justify-center text-primary-300">
                <span className="text-6xl">👗</span>
              </div>
            }
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
    </Modal>
  );
}
