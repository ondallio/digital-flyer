import { describe, it, expect } from 'vitest';
import {
  generateSlug,
  generateRandomSlug,
  validateSlug,
  resolveSlugConflict,
  generateEditToken,
} from './slug';

describe('generateSlug', () => {
  it('영문은 소문자로 변환', () => {
    expect(generateSlug('MyShop')).toBe('myshop');
  });

  it('공백은 하이픈으로 변환', () => {
    expect(generateSlug('my shop')).toBe('my-shop');
  });

  it('한글은 제거', () => {
    const slug = generateSlug('롯데백화점 MyShop');
    expect(slug).toBe('myshop');
  });

  it('특수문자는 제거', () => {
    expect(generateSlug('my@shop#store!')).toBe('myshopstore');
  });

  it('연속 하이픈은 단일 하이픈으로', () => {
    expect(generateSlug('my---shop')).toBe('my-shop');
  });

  it('시작/끝 하이픈 제거', () => {
    expect(generateSlug('-myshop-')).toBe('myshop');
  });

  it('빈 문자열이면 랜덤 slug 생성', () => {
    const slug = generateSlug('');
    expect(slug.length).toBe(8);
    expect(/^[a-z0-9]+$/.test(slug)).toBe(true);
  });

  it('한글만 있으면 랜덤 slug 생성', () => {
    const slug = generateSlug('롯데백화점');
    expect(slug.length).toBe(8);
    expect(/^[a-z0-9]+$/.test(slug)).toBe(true);
  });
});

describe('generateRandomSlug', () => {
  it('기본 길이 8자', () => {
    const slug = generateRandomSlug();
    expect(slug.length).toBe(8);
  });

  it('지정 길이로 생성', () => {
    const slug = generateRandomSlug(12);
    expect(slug.length).toBe(12);
  });

  it('영문 소문자와 숫자만 포함', () => {
    const slug = generateRandomSlug(100);
    expect(/^[a-z0-9]+$/.test(slug)).toBe(true);
  });

  it('매번 다른 값 생성', () => {
    const slug1 = generateRandomSlug();
    const slug2 = generateRandomSlug();
    expect(slug1).not.toBe(slug2);
  });
});

describe('validateSlug', () => {
  it('정상 slug는 valid', () => {
    expect(validateSlug('my-shop-123')).toEqual({ valid: true });
  });

  it('빈 문자열은 invalid', () => {
    const result = validateSlug('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('비어있을 수 없습니다');
  });

  it('3자 미만은 invalid', () => {
    const result = validateSlug('ab');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('3자 이상');
  });

  it('50자 초과는 invalid', () => {
    const longSlug = 'a'.repeat(51);
    const result = validateSlug(longSlug);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('50자 이하');
  });

  it('대문자 포함은 invalid', () => {
    const result = validateSlug('MyShop');
    expect(result.valid).toBe(false);
  });

  it('특수문자 포함은 invalid', () => {
    const result = validateSlug('my@shop');
    expect(result.valid).toBe(false);
  });

  it('연속 하이픈은 invalid', () => {
    const result = validateSlug('my--shop');
    expect(result.valid).toBe(false);
  });

  it('시작 하이픈은 invalid', () => {
    const result = validateSlug('-myshop');
    expect(result.valid).toBe(false);
  });

  it('끝 하이픈은 invalid', () => {
    const result = validateSlug('myshop-');
    expect(result.valid).toBe(false);
  });
});

describe('resolveSlugConflict', () => {
  it('충돌 없으면 원본 반환', () => {
    const existing = ['shop1', 'shop2'];
    expect(resolveSlugConflict('myshop', existing)).toBe('myshop');
  });

  it('충돌 시 -1 추가', () => {
    const existing = ['myshop'];
    expect(resolveSlugConflict('myshop', existing)).toBe('myshop-1');
  });

  it('연속 충돌 시 숫자 증가', () => {
    const existing = ['myshop', 'myshop-1', 'myshop-2'];
    expect(resolveSlugConflict('myshop', existing)).toBe('myshop-3');
  });

  it('빈 목록이면 원본 반환', () => {
    expect(resolveSlugConflict('myshop', [])).toBe('myshop');
  });
});

describe('generateEditToken', () => {
  it('32자 토큰 생성', () => {
    const token = generateEditToken();
    expect(token.length).toBe(32);
  });

  it('영문 대소문자와 숫자만 포함', () => {
    const token = generateEditToken();
    expect(/^[A-Za-z0-9]+$/.test(token)).toBe(true);
  });

  it('매번 다른 값 생성', () => {
    const token1 = generateEditToken();
    const token2 = generateEditToken();
    expect(token1).not.toBe(token2);
  });
});

