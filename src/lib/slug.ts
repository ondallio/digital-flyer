/**
 * slug 생성: 매장명에서 URL-safe한 slug 생성
 * @param shopName 매장명
 * @returns slug (영문/숫자/하이픈만 포함)
 */
export function generateSlug(shopName: string): string {
  // 한글 제거하고 영문/숫자만 유지, 공백은 하이픈으로
  let slug = shopName
    .toLowerCase()
    .trim()
    .replace(/[가-힣]/g, '') // 한글 제거
    .replace(/[^a-z0-9\s-]/g, '') // 영문/숫자/공백/하이픈만 유지
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속 하이픈 제거
    .replace(/^-|-$/g, ''); // 시작/끝 하이픈 제거

  // 빈 문자열이면 랜덤 생성
  if (!slug) {
    slug = generateRandomSlug();
  }

  return slug;
}

/**
 * 랜덤 slug 생성
 * @param length 길이 (기본값: 8)
 * @returns 랜덤 slug
 */
export function generateRandomSlug(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * slug 유효성 검사
 * @param slug 검사할 slug
 * @returns 유효성 검사 결과
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug || slug.length === 0) {
    return { valid: false, error: 'slug는 비어있을 수 없습니다.' };
  }

  if (slug.length < 3) {
    return { valid: false, error: 'slug는 3자 이상이어야 합니다.' };
  }

  if (slug.length > 50) {
    return { valid: false, error: 'slug는 50자 이하여야 합니다.' };
  }

  // 영문 소문자, 숫자, 하이픈만 허용
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    return {
      valid: false,
      error: 'slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.',
    };
  }

  return { valid: true };
}

/**
 * slug 충돌 시 suffix 추가
 * @param baseSlug 기본 slug
 * @param existingSlugs 기존 slug 목록
 * @returns 유니크한 slug
 */
export function resolveSlugConflict(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 1;
  let newSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(newSlug)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  return newSlug;
}

/**
 * edit token 생성
 * @returns 32자 랜덤 토큰
 */
export function generateEditToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

