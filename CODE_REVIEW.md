# 코드베이스 평가 보고서

**평가일:** 2026-01-07
**프로젝트:** Digital Flyer Service (디지털 전단지)
**버전:** 1.0.1

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **유형** | React + Supabase 풀스택 웹 애플리케이션 |
| **목적** | 백화점 매장 관리자가 인증 없이 디지털 전단지를 생성/관리하고, 고객이 모바일에서 카카오톡 연동으로 확인하는 플랫폼 |
| **주요 사용자** | 관리자, 매장 매니저, 고객 |

---

## 2. 기술 스택

| 영역 | 기술 | 버전 | 평가 |
|------|------|------|------|
| 프론트엔드 | React | 19.0.0 | ✅ 최신 |
| 타입 시스템 | TypeScript | 5.7.2 | ✅ Strict 모드 |
| 라우팅 | React Router | 7.1.1 | ✅ 최신 |
| 빌드 도구 | Vite | 6.0.7 | ✅ 빠른 HMR |
| 스타일링 | Tailwind CSS | 3.4.17 | ✅ 유틸리티 우선 |
| 백엔드 | Supabase | 2.89.0 | ✅ BaaS |
| 아이콘 | Lucide React | 0.468.0 | ✅ |
| 테스트 | Vitest + RTL | 2.1.8 | ✅ |

---

## 3. 아키텍처 분석

### 3.1 디렉토리 구조

```
src/
├── lib/                    # 비즈니스 로직
│   ├── price.ts           # 가격 계산
│   ├── slug.ts            # URL 슬러그 생성
│   ├── storage.ts         # localStorage 저장소
│   ├── supabase.ts        # Supabase 클라이언트
│   └── unified-storage.ts # 통합 저장소 어댑터
├── types/                  # 타입 정의
│   ├── index.ts           # 도메인 엔티티
│   └── database.ts        # Supabase 자동 생성 타입
├── pages/
│   ├── admin/             # 관리자 페이지
│   ├── manager/           # 매니저 편집 페이지
│   └── public/            # 고객용 공개 페이지
└── test/                   # 테스트 설정
```

### 3.2 라우트 구조

| 경로 | 컴포넌트 | 용도 | 접근 권한 |
|------|----------|------|----------|
| `/admin` | AdminDashboard | 대시보드 | 관리자 |
| `/admin/requests` | AdminRequests | 입점 요청 관리 | 관리자 |
| `/admin/vendors` | AdminVendors | 입점사 목록 | 관리자 |
| `/admin/vendors/:id` | AdminVendorDetail | 입점사 상세 | 관리자 |
| `/admin/tickets` | AdminTickets | 문의 관리 | 관리자 |
| `/edit/:token` | ManagerEdit | 전단지 편집 | 토큰 기반 |
| `/s/:slug` | PublicFlyer | 고객용 전단지 | 공개 |

### 3.3 데이터 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
└────────────────────────┬────────────────────────────────────┘
                         │ calls
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              unified-storage.ts (Adapter)                    │
│              - isSupabaseConfigured() 체크                   │
│              - 적절한 구현체로 라우팅                          │
└────────┬───────────────────────────────────┬────────────────┘
         │                                   │
         ▼                                   ▼
┌──────────────────────┐          ┌──────────────────────┐
│    supabase.ts       │          │    storage.ts        │
│    (Production)      │          │    (Development)     │
│    - PostgreSQL      │          │    - localStorage    │
│    - Storage         │          │    - 데모 데이터      │
└──────────────────────┘          └──────────────────────┘
```

---

## 4. 강점 (Strengths)

### 4.1 Repository/Adapter 패턴 ✅

데이터 소스를 추상화하여 Supabase와 localStorage 간 전환이 용이합니다.

```typescript
// unified-storage.ts
export const vendorRepository = {
  getAll: () => isSupabaseConfigured()
    ? supabaseVendorRepository.getAll()
    : localVendorRepository.getAll(),
  // ...
};
```

### 4.2 엄격한 타입 안전성 ✅

- TypeScript strict 모드 활성화
- `noUnusedLocals`, `noUnusedParameters` 적용
- Supabase 자동 생성 타입 활용

### 4.3 명확한 관심사 분리 ✅

- `lib/` - 비즈니스 로직
- `pages/` - UI 컴포넌트
- `types/` - 타입 정의

### 4.4 모바일 최적화 ✅

- 매니저/고객 페이지 모바일 퍼스트 설계
- `.mobile-container`로 최대 430px 제한
- 터치 친화적 UI

### 4.5 폴백 전략 ✅

- Supabase 미설정 시 localStorage 자동 폴백
- 오프라인/데모 환경 지원

---

## 5. 개선 필요 사항 (Improvements Needed)

### 5.1 보안 이슈 🔴 Critical

| 문제 | 현재 상태 | 위험도 | 권장 조치 |
|------|----------|--------|----------|
| 관리자 인증 없음 | `/admin` 누구나 접근 가능 | 높음 | Supabase Auth + RLS 추가 |
| 토큰 평문 저장 | `edit_token`이 DB에 평문 | 중간 | bcrypt 해싱 적용 |
| RLS 미적용 | 모든 테이블 공개 | 높음 | Row Level Security 정책 추가 |

### 5.2 기능 미완성 🟡 Medium

| 문제 | 파일 | 권장 조치 |
|------|------|----------|
| 이미지 업로드 미연결 | `ManagerEdit.tsx` | Supabase Storage `uploadImage()` 호출 연결 |
| 드래그 정렬 미구현 | ProductForm | react-dnd 또는 @dnd-kit 추가 |
| 에러 바운더리 없음 | `App.tsx` | `<ErrorBoundary>` 컴포넌트 래핑 |

### 5.3 코드 품질 🟢 Low

| 문제 | 권장 조치 |
|------|----------|
| console.error 사용 | Sentry 등 로깅 서비스 도입 |
| 상수 하드코딩 | `constants.ts` 파일로 중앙화 |
| 캐싱 없음 | React Query 또는 SWR 도입 |
| 큰 컴포넌트 | `ManagerEdit.tsx` (512줄) 분리 필요 |

---

## 6. 주요 파일 평가

| 파일 | 줄 수 | 점수 | 코멘트 |
|------|-------|------|--------|
| `unified-storage.ts` | 565 | ⭐⭐⭐⭐ | Adapter 패턴 잘 적용, 에러 처리 개선 필요 |
| `ManagerEdit.tsx` | 512 | ⭐⭐⭐ | 기능 완성도 높음, 컴포넌트 분리 필요 |
| `PublicFlyer.tsx` | 314 | ⭐⭐⭐⭐ | 조회수 추적, 카카오 CTA 잘 구현 |
| `AdminDashboard.tsx` | 248 | ⭐⭐⭐⭐ | 통계 표시, 미완성 입점사 알림 좋음 |
| `price.ts` | 79 | ⭐⭐⭐⭐⭐ | 단일 책임, 테스트 있음 |
| `slug.ts` | 103 | ⭐⭐⭐⭐⭐ | 단일 책임, 테스트 있음 |

---

## 7. 테스트 현황

### 7.1 현재 상태

- **테스트 프레임워크:** Vitest + React Testing Library
- **테스트 파일:** `price.test.ts`, `slug.test.ts`
- **커버리지:** 미측정

### 7.2 권장 테스트 추가

```
우선순위 1: 단위 테스트
- [ ] unified-storage.ts 레포지토리 함수
- [ ] 가격 계산 엣지 케이스

우선순위 2: 통합 테스트
- [ ] 입점 요청 승인 플로우
- [ ] 전단지 편집 저장 플로우

우선순위 3: E2E 테스트
- [ ] 관리자 전체 워크플로우
- [ ] 고객 전단지 조회
```

---

## 8. 종합 점수

| 항목 | 점수 | 가중치 | 가중 점수 |
|------|------|--------|----------|
| 코드 구조 | 8/10 | 20% | 1.6 |
| 타입 안전성 | 9/10 | 15% | 1.35 |
| 보안 | 4/10 | 25% | 1.0 |
| 테스트 | 5/10 | 15% | 0.75 |
| UX/UI | 8/10 | 15% | 1.2 |
| 유지보수성 | 7/10 | 10% | 0.7 |
| **총점** | | 100% | **6.6/10** |

---

## 9. 권장 작업 우선순위

### Phase 1: 보안 강화 (긴급)

1. Supabase Auth 도입
2. RLS (Row Level Security) 정책 추가
3. edit_token 해싱 처리
4. 관리자 라우트 보호

### Phase 2: 안정성 개선 (중요)

1. Error Boundary 추가
2. 이미지 업로드 Supabase Storage 연결
3. 입력값 검증 강화
4. 로딩/에러 상태 일관성 확보

### Phase 3: 코드 품질 (개선)

1. 큰 컴포넌트 분리 (ManagerEdit.tsx)
2. 상수 중앙화
3. 테스트 커버리지 확대
4. 로깅 서비스 도입

### Phase 4: 기능 완성 (선택)

1. 드래그 앤 드롭 상품 정렬
2. React Query 캐싱 도입
3. PWA 지원
4. 다크 모드

---

## 10. 버그 수정 이력 (2026-01-07)

### 수정 완료된 버그

| 버그 | 파일 | 수정 내용 |
|------|------|----------|
| Import 경로 불일치 | `AdminRequests.tsx` | `storage` → `unified-storage` 변경, async/await 추가 |
| Import 경로 불일치 | `AdminVendors.tsx` | `storage` → `unified-storage` 변경, async/await 추가 |
| Import 경로 불일치 | `AdminVendorDetail.tsx` | `storage` → `unified-storage` 변경, async/await 추가 |
| getBySlug 필터 누락 | `storage.ts` | `status === 'active'` 필터 추가 |
| kakaoUrl 항상 빈 문자열 | `unified-storage.ts` | memo에서 카카오 URL 자동 추출 함수 추가 |
| 테스트 환경 깨짐 | `node_modules` | 패키지 재설치로 해결 |

### 테스트 결과

```
✓ src/lib/slug.test.ts (28 tests)
✓ src/lib/price.test.ts (29 tests)
Test Files  2 passed (2)
Tests  57 passed (57)
```

---

## 11. 결론

이 프로젝트는 **잘 설계된 MVP**입니다. Repository/Adapter 패턴, 엄격한 TypeScript 설정, 모바일 최적화 UX 등 좋은 아키텍처 결정이 많습니다.

그러나 **프로덕션 배포 전 보안 강화가 필수**입니다. 특히 관리자 인증과 RLS 정책 추가가 최우선 과제입니다.

보안 이슈만 해결되면 프로덕션 배포가 가능한 수준입니다.

---

*이 문서는 Claude Code에 의해 자동 생성되었습니다.*
