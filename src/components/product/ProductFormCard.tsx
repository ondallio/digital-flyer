import { GripVertical, Trash2 } from 'lucide-react';
import { FormInput } from '../ui/FormInput';
import { ImageUploader } from '../ui/ImageUploader';
import { calculateSalePrice, formatPrice } from '../../lib/price';
import type { ProductFormData } from '../../types';

interface ProductFormCardProps {
  index: number;
  product: ProductFormData;
  onUpdate: (field: keyof ProductFormData, value: string | number | boolean) => void;
  onRemove: () => void;
  onImageChange: (dataUrl: string) => void;
}

export function ProductFormCard({
  index,
  product,
  onUpdate,
  onRemove,
  onImageChange,
}: ProductFormCardProps) {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary-400">
          <GripVertical size={18} />
          <span className="font-medium text-primary-700">상품 {index + 1}</span>
        </div>
        <button
          onClick={onRemove}
          className="p-1 text-red-500 hover:bg-red-50 rounded"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <ImageUploader
        value={product.image || ''}
        onChange={onImageChange}
        variant="product"
      />

      <FormInput
        label="상품명"
        value={product.name}
        onChange={(e) => onUpdate('name', e.target.value)}
        placeholder="예: 캐시미어 코트"
      />

      <div className="grid grid-cols-2 gap-3">
        <FormInput
          label="정가 (원)"
          type="number"
          value={product.originalPrice || ''}
          onChange={(e) => onUpdate('originalPrice', parseInt(e.target.value) || 0)}
          placeholder="100000"
        />
        <FormInput
          label="할인율 (%)"
          type="number"
          value={product.discountRate || ''}
          onChange={(e) => onUpdate('discountRate', parseInt(e.target.value) || 0)}
          placeholder="30"
          min={0}
          max={100}
        />
      </div>

      {product.originalPrice > 0 && (
        <div className="bg-primary-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary-500">판매가</span>
            <div className="text-right">
              <span className="text-sm text-primary-400 line-through mr-2">
                {formatPrice(product.originalPrice)}
              </span>
              {product.discountRate > 0 && (
                <span className="text-sm text-red-500 mr-2">
                  {product.discountRate}%
                </span>
              )}
              <span className="font-bold text-lg">
                {formatPrice(calculateSalePrice(product.originalPrice, product.discountRate))}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-primary-200 pt-3 mt-3">
        <label className="text-sm font-medium text-primary-700 mb-2 block">세일 기간</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-primary-500 mb-1 block">시작일</label>
            <input
              type="date"
              value={product.saleStartDate || ''}
              onChange={(e) => onUpdate('saleStartDate', e.target.value)}
              className="input text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-primary-500 mb-1 block">종료일</label>
            <input
              type="date"
              value={product.saleEndDate || ''}
              onChange={(e) => onUpdate('saleEndDate', e.target.value)}
              className="input text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-sm font-medium text-primary-700">메인 노출</span>
          <p className="text-xs text-primary-400">상단에 우선 표시됩니다</p>
        </div>
        <button
          type="button"
          onClick={() => onUpdate('isFeatured', !product.isFeatured)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            product.isFeatured ? 'bg-primary-900' : 'bg-primary-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              product.isFeatured ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
