# Changelog

이 프로젝트의 모든 주요 변경 사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

---

## [1.0.1] - 2026-01-07

### Fixed

- **Admin 페이지 Supabase 연동 버그 수정**
  - `AdminRequests.tsx`: `storage` → `unified-storage` import 변경, async/await 추가
  - `AdminVendors.tsx`: `storage` → `unified-storage` import 변경, async/await 추가
  - `AdminVendorDetail.tsx`: `storage` → `unified-storage` import 변경, async/await 추가

- **localStorage getBySlug 필터 누락**
  - `storage.ts`: `status === 'active'` 조건 추가하여 Supabase 동작과 일관성 확보

- **Request kakaoUrl 항상 빈 문자열 문제**
  - `unified-storage.ts`: memo 필드에서 카카오톡 오픈채팅 URL 자동 추출 함수 추가

- **테스트 환경 깨짐**
  - `node_modules` 재설치로 Vitest 모듈 오류 해결

### Changed

- `CODE_REVIEW.md`: 버그 수정 이력 섹션 추가

---

## [1.0.0] - 2026-01-06

### Added

- **초기 프로젝트 구조**
  - React 19 + TypeScript 5.7 + Vite 6 기반 설정
  - Tailwind CSS 스타일링
  - Supabase 백엔드 연동

- **관리자 대시보드** (`/admin`)
  - 대기 중 신청, 총 거래처, 활성 거래처, 미응답 문의 통계
  - 데모 데이터 생성 기능

- **신청 관리** (`/admin/requests`)
  - 입점 신청 목록 조회 (대기/승인/반려 탭)
  - 신청 승인 시 자동 Vendor 생성 및 URL 발급
  - 신청 반려 기능

- **거래처 관리** (`/admin/vendors`)
  - 거래처 목록 조회 (활성/숨김/차단 탭)
  - 상태 변경 기능
  - 상품 수 표시

- **거래처 상세** (`/admin/vendors/:id`)
  - 기본 정보, 링크 관리, 등록 상품 조회
  - 편집 토큰 재발급 기능
  - 전단지 미리보기 (iframe)

- **문의 관리** (`/admin/tickets`)
  - 티켓 목록 조회
  - 상태 변경 기능

- **매니저 편집 페이지** (`/edit/:token`)
  - 토큰 기반 접근 (인증 불필요)
  - 매니저 사진 업로드
  - 기본 정보 편집 (매장명, 담당자명, 카카오톡 링크)
  - 상품 등록/수정/삭제 (최대 6개)
  - 세일 기간 및 메인 노출 설정
  - 실시간 판매가 미리보기

- **고객용 전단지** (`/s/:slug`)
  - 매장 정보 및 매니저 사진 표시
  - 카카오톡 문의 CTA 버튼
  - 상품 그리드 (추천 상품 우선 표시)
  - 상품 상세 모달
  - 조회수 추적

- **데이터 레이어**
  - `unified-storage.ts`: Supabase/localStorage 어댑터 패턴
  - `storage.ts`: localStorage 폴백 저장소
  - `supabase.ts`: Supabase 클라이언트 및 이미지 업로드
  - `supabase-storage.ts`: Supabase 전용 레포지토리

- **유틸리티**
  - `price.ts`: 가격 계산 (할인가, 포맷팅, 유효성 검증)
  - `slug.ts`: URL 슬러그 생성 및 충돌 해결

- **테스트**
  - `price.test.ts`: 가격 계산 단위 테스트 (29개)
  - `slug.test.ts`: 슬러그 생성 단위 테스트 (28개)

- **배포 설정**
  - `vercel.json`: SPA 라우팅 설정

---

## 향후 계획

### 보안 강화 (우선순위 높음)
- [ ] Supabase Auth 도입
- [ ] RLS (Row Level Security) 정책 추가
- [ ] edit_token 해싱 처리
- [ ] 관리자 라우트 보호

### 안정성 개선
- [ ] Error Boundary 추가
- [ ] 이미지 업로드 Supabase Storage 연결
- [ ] 입력값 검증 강화

### 기능 완성
- [ ] 드래그 앤 드롭 상품 정렬
- [ ] React Query 캐싱 도입
- [ ] PWA 지원
- [ ] 다크 모드
