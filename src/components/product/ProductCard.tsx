import { LazyImage } from '../LazyImage';
import { formatPrice, formatDiscountRate } from '../../lib/price';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <button
      onClick={onClick}
      className={`card overflow-hidden text-left hover:shadow-md transition-shadow ${
        product.isFeatured ? 'ring-2 ring-primary-900' : ''
      }`}
    >
      <div className="relative aspect-square bg-primary-100">
        {product.image ? (
          <LazyImage
            src={product.image}
            alt={product.name}
            className="w-full h-full"
            fallback={
              <div className="w-full h-full flex items-center justify-center text-primary-300">
                <span className="text-4xl">👗</span>
              </div>
            }
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
        {(product.saleStartDate || product.saleEndDate) && (
          <p className="text-xs text-primary-400 mt-1">
            {product.saleStartDate && product.saleEndDate
              ? `${product.saleStartDate} ~ ${product.saleEndDate}`
              : product.saleEndDate
              ? `~${product.saleEndDate}까지`
              : `${product.saleStartDate}~`}
          </p>
        )}
      </div>
    </button>
  );
}
