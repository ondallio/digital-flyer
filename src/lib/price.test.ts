import { describe, it, expect } from 'vitest';
import {
  calculateSalePrice,
  calculateDiscountRate,
  formatPrice,
  formatDiscountRate,
  validatePriceInput,
} from './price';

describe('calculateSalePrice', () => {
  it('정가 100,000원에 30% 할인 시 70,000원', () => {
    expect(calculateSalePrice(100000, 30)).toBe(70000);
  });

  it('정가 99,000원에 20% 할인 시 79,200원 (반올림)', () => {
    expect(calculateSalePrice(99000, 20)).toBe(79200);
  });

  it('정가 10,000원에 15% 할인 시 8,500원', () => {
    expect(calculateSalePrice(10000, 15)).toBe(8500);
  });

  it('할인율 0%면 정가와 동일', () => {
    expect(calculateSalePrice(50000, 0)).toBe(50000);
  });

  it('할인율 100%면 0원', () => {
    expect(calculateSalePrice(50000, 100)).toBe(0);
  });

  it('소수점 결과는 반올림', () => {
    // 100000 * (1 - 0.6666666) = 33333.34 → 33333
    expect(calculateSalePrice(100000, 66.66666)).toBe(33333);
  });

  it('음수 정가는 에러', () => {
    expect(() => calculateSalePrice(-1000, 10)).toThrow('정가는 0 이상이어야 합니다.');
  });

  it('음수 할인율은 에러', () => {
    expect(() => calculateSalePrice(10000, -10)).toThrow('할인율은 0에서 100 사이여야 합니다.');
  });

  it('100 초과 할인율은 에러', () => {
    expect(() => calculateSalePrice(10000, 101)).toThrow('할인율은 0에서 100 사이여야 합니다.');
  });
});

describe('calculateDiscountRate', () => {
  it('100,000원에서 70,000원이면 30% 할인', () => {
    expect(calculateDiscountRate(100000, 70000)).toBe(30);
  });

  it('50,000원에서 45,000원이면 10% 할인', () => {
    expect(calculateDiscountRate(50000, 45000)).toBe(10);
  });

  it('동일 가격이면 0% 할인', () => {
    expect(calculateDiscountRate(10000, 10000)).toBe(0);
  });

  it('판매가 0원이면 100% 할인', () => {
    expect(calculateDiscountRate(10000, 0)).toBe(100);
  });

  it('소수점 결과는 첫째자리까지 반올림', () => {
    // 33.333...% → 33.3%
    expect(calculateDiscountRate(30000, 20000)).toBe(33.3);
  });

  it('정가 0원은 에러', () => {
    expect(() => calculateDiscountRate(0, 0)).toThrow('정가는 0보다 커야 합니다.');
  });

  it('음수 판매가는 에러', () => {
    expect(() => calculateDiscountRate(10000, -1000)).toThrow('판매가는 0 이상이어야 합니다.');
  });

  it('판매가가 정가보다 크면 에러', () => {
    expect(() => calculateDiscountRate(10000, 15000)).toThrow('판매가는 정가보다 클 수 없습니다.');
  });
});

describe('formatPrice', () => {
  it('1000 → "1,000원"', () => {
    expect(formatPrice(1000)).toBe('1,000원');
  });

  it('29000 → "29,000원"', () => {
    expect(formatPrice(29000)).toBe('29,000원');
  });

  it('1234567 → "1,234,567원"', () => {
    expect(formatPrice(1234567)).toBe('1,234,567원');
  });

  it('0 → "0원"', () => {
    expect(formatPrice(0)).toBe('0원');
  });
});

describe('formatDiscountRate', () => {
  it('30 → "30%"', () => {
    expect(formatDiscountRate(30)).toBe('30%');
  });

  it('0 → "0%"', () => {
    expect(formatDiscountRate(0)).toBe('0%');
  });

  it('100 → "100%"', () => {
    expect(formatDiscountRate(100)).toBe('100%');
  });
});

describe('validatePriceInput', () => {
  it('정상 입력은 valid: true', () => {
    expect(validatePriceInput(10000, 20)).toEqual({ valid: true });
  });

  it('정가 음수는 invalid', () => {
    const result = validatePriceInput(-1000, 20);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('할인율 음수는 invalid', () => {
    const result = validatePriceInput(10000, -10);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('할인율 100 초과는 invalid', () => {
    const result = validatePriceInput(10000, 150);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('NaN 정가는 invalid', () => {
    const result = validatePriceInput(NaN, 20);
    expect(result.valid).toBe(false);
  });
});

