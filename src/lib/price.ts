/**
 * 판매가 계산: 정가에서 할인율을 적용하여 판매가 계산
 * @param originalPrice 정가 (원)
 * @param discountRate 할인율 (0-100)
 * @returns 판매가 (원, 반올림)
 */
export function calculateSalePrice(originalPrice: number, discountRate: number): number {
  // 유효성 검사
  if (originalPrice < 0) {
    throw new Error('정가는 0 이상이어야 합니다.');
  }
  if (discountRate < 0 || discountRate > 100) {
    throw new Error('할인율은 0에서 100 사이여야 합니다.');
  }

  // 할인 적용 및 반올림
  const discountMultiplier = 1 - discountRate / 100;
  const salePrice = Math.round(originalPrice * discountMultiplier);

  return salePrice;
}

/**
 * 할인율 계산: 정가와 판매가로부터 할인율 계산
 * @param originalPrice 정가 (원)
 * @param salePrice 판매가 (원)
 * @returns 할인율 (0-100, 소수점 첫째자리 반올림)
 */
export function calculateDiscountRate(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0) {
    throw new Error('정가는 0보다 커야 합니다.');
  }
  if (salePrice < 0) {
    throw new Error('판매가는 0 이상이어야 합니다.');
  }
  if (salePrice > originalPrice) {
    throw new Error('판매가는 정가보다 클 수 없습니다.');
  }

  const discountRate = ((originalPrice - salePrice) / originalPrice) * 100;
  return Math.round(discountRate * 10) / 10; // 소수점 첫째자리까지
}

/**
 * 가격 포맷팅: 숫자를 원화 형식으로 변환
 * @param price 가격 (원)
 * @returns 포맷된 문자열 (예: "29,000원")
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

/**
 * 할인율 포맷팅
 * @param rate 할인율 (0-100)
 * @returns 포맷된 문자열 (예: "30%")
 */
export function formatDiscountRate(rate: number): string {
  return `${rate}%`;
}

/**
 * 가격 유효성 검사
 * @param originalPrice 정가
 * @param discountRate 할인율
 * @returns 유효성 검사 결과
 */
export function validatePriceInput(
  originalPrice: number,
  discountRate: number
): { valid: boolean; error?: string } {
  if (isNaN(originalPrice) || originalPrice < 0) {
    return { valid: false, error: '정가를 올바르게 입력해주세요.' };
  }
  if (isNaN(discountRate) || discountRate < 0 || discountRate > 100) {
    return { valid: false, error: '할인율은 0에서 100 사이로 입력해주세요.' };
  }
  return { valid: true };
}

