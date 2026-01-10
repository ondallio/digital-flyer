import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Save, Eye, ImagePlus } from 'lucide-react';
import { useVendorByToken, useToast } from '../../hooks';
import { vendorRepository, productRepository } from '../../lib/unified-storage';
import { calculateSalePrice, validatePriceInput } from '../../lib/price';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Toast } from '../../components/ui/Toast';
import { FormInput } from '../../components/ui/FormInput';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProductFormCard } from '../../components/product/ProductFormCard';
import type { ProductFormData } from '../../types';

const MAX_PRODUCTS = 6;

export default function ManagerEdit() {
  const { token } = useParams<{ token: string }>();
  const { vendor, products: initialProducts, loading } = useVendorByToken(token);
  const { message: toast, showToast } = useToast();
  const [saving, setSaving] = useState(false);

  // Form state
  const [managerPhoto, setManagerPhoto] = useState<string>('');
  const [managerName, setManagerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [kakaoUrl, setKakaoUrl] = useState('');
  const [products, setProducts] = useState<ProductFormData[]>([]);

  // Initialize form when vendor loads
  useEffect(() => {
    if (vendor) {
      setManagerPhoto(vendor.managerPhoto || '');
      setManagerName(vendor.managerName);
      setShopName(vendor.shopName);
      setKakaoUrl(vendor.kakaoUrl);
    }
  }, [vendor]);

  useEffect(() => {
    if (initialProducts.length > 0) {
      setProducts(
        initialProducts.map((p) => ({
          name: p.name,
          image: p.image,
          originalPrice: p.originalPrice,
          discountRate: p.discountRate,
          saleStartDate: p.saleStartDate || '',
          saleEndDate: p.saleEndDate || '',
          isFeatured: p.isFeatured || false,
        }))
      );
    }
  }, [initialProducts]);

  const addProduct = useCallback(() => {
    if (products.length >= MAX_PRODUCTS) {
      showToast(`상품은 최대 ${MAX_PRODUCTS}개까지 등록 가능합니다`);
      return;
    }
    setProducts((prev) => [
      ...prev,
      { name: '', image: '', originalPrice: 0, discountRate: 0, saleStartDate: '', saleEndDate: '', isFeatured: false },
    ]);
  }, [products.length, showToast]);

  const removeProduct = useCallback((index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateProduct = useCallback((index: number, field: keyof ProductFormData, value: string | number | boolean) => {
    setProducts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const handleSave = async () => {
    if (!vendor) return;

    if (!shopName.trim()) {
      showToast('매장명을 입력해주세요');
      return;
    }
    if (!kakaoUrl.trim()) {
      showToast('카카오톡 링크를 입력해주세요');
      return;
    }

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (!p.name.trim()) {
        showToast(`상품 ${i + 1}의 이름을 입력해주세요`);
        return;
      }
      const validation = validatePriceInput(p.originalPrice, p.discountRate);
      if (!validation.valid) {
        showToast(`상품 ${i + 1}: ${validation.error}`);
        return;
      }
    }

    setSaving(true);

    try {
      await vendorRepository.update(vendor.id, {
        managerPhoto,
        managerName,
        shopName,
        kakaoUrl,
      });

      await productRepository.bulkSaveForVendor(
        vendor.id,
        products.map((p) => ({
          name: p.name,
          image: p.image || '',
          originalPrice: p.originalPrice,
          discountRate: p.discountRate,
          salePrice: calculateSalePrice(p.originalPrice, p.discountRate),
          sortOrder: 0,
          saleStartDate: p.saleStartDate || undefined,
          saleEndDate: p.saleEndDate || undefined,
          isFeatured: p.isFeatured || false,
        }))
      );

      showToast('저장되었습니다!');
    } catch {
      showToast('저장 중 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  const openPreview = useCallback(() => {
    if (vendor) {
      window.open(`/s/${vendor.slug}`, '_blank');
    }
  }, [vendor]);

  if (loading) {
    return <LoadingSpinner fullScreen message="로딩 중..." />;
  }

  if (!vendor) {
    return (
      <div className="mobile-container flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-xl font-semibold mb-2">접근할 수 없는 페이지</h1>
        <p className="text-primary-500">
          유효하지 않은 편집 링크입니다.
          <br />
          관리자에게 새 링크를 요청해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-primary-200 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">전단지 편집</h1>
          <button onClick={openPreview} className="btn btn-outline text-sm py-2">
            <Eye size={16} />
            미리보기
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Manager Photo */}
        <section className="space-y-3">
          <h2 className="font-semibold">매니저 사진</h2>
          <div className="flex justify-center">
            <ImageUploader
              value={managerPhoto}
              onChange={setManagerPhoto}
              variant="avatar"
            />
          </div>
        </section>

        {/* Basic Info */}
        <section className="space-y-3">
          <h2 className="font-semibold">기본 정보</h2>
          <div className="space-y-3">
            <FormInput
              label="매장명"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="예: 롯데백화점 본점"
            />
            <FormInput
              label="담당자명"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              placeholder="예: 김민수"
            />
            <FormInput
              label="카카오톡 링크"
              type="url"
              value={kakaoUrl}
              onChange={(e) => setKakaoUrl(e.target.value)}
              placeholder="https://open.kakao.com/o/..."
              hint="오픈채팅 또는 채널 링크를 입력하세요"
            />
          </div>
        </section>

        {/* Products */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">상품 ({products.length}/{MAX_PRODUCTS})</h2>
            <button
              onClick={addProduct}
              disabled={products.length >= MAX_PRODUCTS}
              className="btn btn-outline text-sm py-2 disabled:opacity-50"
            >
              <Plus size={16} />
              추가
            </button>
          </div>

          {products.length === 0 ? (
            <EmptyState
              icon={<ImagePlus size={48} className="mx-auto text-primary-300" />}
              title="상품을 추가해주세요"
              action={
                <button onClick={addProduct} className="btn btn-primary">
                  <Plus size={18} />
                  첫 상품 추가
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {products.map((product, index) => (
                <ProductFormCard
                  key={index}
                  index={index}
                  product={product}
                  onUpdate={(field, value) => updateProduct(index, field, value)}
                  onRemove={() => removeProduct(index)}
                  onImageChange={(dataUrl) => updateProduct(index, 'image', dataUrl)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-primary-200 p-4 max-w-[430px] mx-auto">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary w-full disabled:opacity-50"
        >
          {saving ? (
            '저장 중...'
          ) : (
            <>
              <Save size={18} />
              저장하기
            </>
          )}
        </button>
      </div>

      <Toast message={toast} />
    </div>
  );
}
