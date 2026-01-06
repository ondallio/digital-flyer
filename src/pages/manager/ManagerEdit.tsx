import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Camera, 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  Eye,
  ImagePlus
} from 'lucide-react';
import { vendorRepository, productRepository } from '../../lib/unified-storage';
import { calculateSalePrice, formatPrice, validatePriceInput } from '../../lib/price';
import type { Vendor, ProductFormData } from '../../types';

const MAX_PRODUCTS = 6;

export default function ManagerEdit() {
  const { token } = useParams<{ token: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form state
  const [managerPhoto, setManagerPhoto] = useState<string>('');
  const [managerName, setManagerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [kakaoUrl, setKakaoUrl] = useState('');
  const [products, setProducts] = useState<ProductFormData[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const productFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (token) {
      loadVendor();
    }
  }, [token]);

  const loadVendor = async () => {
    if (!token) return;
    try {
      const v = await vendorRepository.getByEditToken(token);
      if (v) {
        setVendor(v);
        setManagerPhoto(v.managerPhoto || '');
        setManagerName(v.managerName);
        setShopName(v.shopName);
        setKakaoUrl(v.kakaoUrl);

        // Load existing products
        const existingProducts = await productRepository.getByVendorId(v.id);
        if (existingProducts.length > 0) {
          setProducts(
            existingProducts.map((p) => ({
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
      }
    } catch (error) {
      console.error('Failed to load vendor:', error);
    }
    setLoading(false);
  };

  const handleManagerPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setManagerPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProduct(index, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addProduct = () => {
    if (products.length >= MAX_PRODUCTS) {
      showToast(`상품은 최대 ${MAX_PRODUCTS}개까지 등록 가능합니다`);
      return;
    }
    setProducts([
      ...products,
      { name: '', image: '', originalPrice: 0, discountRate: 0, saleStartDate: '', saleEndDate: '', isFeatured: false },
    ]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof ProductFormData, value: string | number | boolean) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const handleSave = async () => {
    if (!vendor) return;

    // Validation
    if (!shopName.trim()) {
      showToast('매장명을 입력해주세요');
      return;
    }
    if (!kakaoUrl.trim()) {
      showToast('카카오톡 링크를 입력해주세요');
      return;
    }

    // Validate products
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
      // Update vendor
      await vendorRepository.update(vendor.id, {
        managerPhoto,
        managerName,
        shopName,
        kakaoUrl,
      });

      // Save products
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
    } catch (error) {
      showToast('저장 중 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const openPreview = () => {
    if (vendor) {
      window.open(`/s/${vendor.slug}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="mobile-container flex items-center justify-center min-h-screen">
        <p className="text-primary-400">로딩 중...</p>
      </div>
    );
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
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-primary-300 hover:border-primary-400 transition-colors"
            >
              {managerPhoto ? (
                <>
                  <img
                    src={managerPhoto}
                    alt="매니저"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                  </div>
                </>
              ) : (
                <Camera className="text-primary-400" size={32} />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleManagerPhotoChange}
              className="hidden"
            />
          </div>
        </section>

        {/* Basic Info */}
        <section className="space-y-3">
          <h2 className="font-semibold">기본 정보</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-primary-500 mb-1 block">매장명</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="예: 롯데백화점 본점"
                className="input"
              />
            </div>
            <div>
              <label className="text-sm text-primary-500 mb-1 block">담당자명</label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="예: 김민수"
                className="input"
              />
            </div>
            <div>
              <label className="text-sm text-primary-500 mb-1 block">카카오톡 링크</label>
              <input
                type="url"
                value={kakaoUrl}
                onChange={(e) => setKakaoUrl(e.target.value)}
                placeholder="https://open.kakao.com/o/..."
                className="input"
              />
              <p className="text-xs text-primary-400 mt-1">
                오픈채팅 또는 채널 링크를 입력하세요
              </p>
            </div>
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
            <div className="text-center py-8 border-2 border-dashed border-primary-200 rounded-lg">
              <ImagePlus size={48} className="mx-auto mb-2 text-primary-300" />
              <p className="text-primary-500">상품을 추가해주세요</p>
              <button onClick={addProduct} className="btn btn-primary mt-4">
                <Plus size={18} />
                첫 상품 추가
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary-400">
                      <GripVertical size={18} />
                      <span className="font-medium text-primary-700">상품 {index + 1}</span>
                    </div>
                    <button
                      onClick={() => removeProduct(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Product Image */}
                  <div
                    onClick={() => productFileRefs.current[index]?.click()}
                    className="relative h-48 bg-primary-100 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-primary-300 hover:border-primary-400 transition-colors"
                  >
                    {product.image ? (
                      <>
                        <img
                          src={product.image}
                          alt={product.name || '상품'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Camera className="text-white" size={24} />
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-primary-400">
                        <ImagePlus size={32} className="mx-auto mb-1" />
                        <span className="text-sm">사진 추가</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={(el) => { productFileRefs.current[index] = el; }}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleProductImageChange(index, e)}
                    className="hidden"
                  />

                  {/* Product Info */}
                  <div>
                    <label className="text-sm text-primary-500 mb-1 block">상품명</label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProduct(index, 'name', e.target.value)}
                      placeholder="예: 캐시미어 코트"
                      className="input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-primary-500 mb-1 block">정가 (원)</label>
                      <input
                        type="number"
                        value={product.originalPrice || ''}
                        onChange={(e) =>
                          updateProduct(index, 'originalPrice', parseInt(e.target.value) || 0)
                        }
                        placeholder="100000"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-primary-500 mb-1 block">할인율 (%)</label>
                      <input
                        type="number"
                        value={product.discountRate || ''}
                        onChange={(e) =>
                          updateProduct(index, 'discountRate', parseInt(e.target.value) || 0)
                        }
                        placeholder="30"
                        min="0"
                        max="100"
                        className="input"
                      />
                    </div>
                  </div>

                  {/* Sale Price Preview */}
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
                            {formatPrice(
                              calculateSalePrice(product.originalPrice, product.discountRate)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sale Period */}
                  <div className="border-t border-primary-200 pt-3 mt-3">
                    <label className="text-sm font-medium text-primary-700 mb-2 block">세일 기간</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-primary-500 mb-1 block">시작일</label>
                        <input
                          type="date"
                          value={product.saleStartDate || ''}
                          onChange={(e) => updateProduct(index, 'saleStartDate', e.target.value)}
                          className="input text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-primary-500 mb-1 block">종료일</label>
                        <input
                          type="date"
                          value={product.saleEndDate || ''}
                          onChange={(e) => updateProduct(index, 'saleEndDate', e.target.value)}
                          className="input text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Featured Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-sm font-medium text-primary-700">메인 노출</span>
                      <p className="text-xs text-primary-400">상단에 우선 표시됩니다</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateProduct(index, 'isFeatured', !product.isFeatured)}
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

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

