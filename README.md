# 디지털 전단지 시스템

거래처(백화점 매니저)가 로그인 없이 전단지를 만들고, 고객은 모바일에서 전단지를 열람하며 카톡으로 문의할 수 있는 시스템입니다.

## 기능

### 관리자 (웹)
- 거래처 신청 승인/반려
- 승인 시 자동으로 고객 링크 + 편집 링크 발급
- 거래처 현황 조회 및 관리 (숨김/차단/토큰 재발급)
- 본사↔거래처 1:1 문의 티켓 처리

### 매장 매니저 (모바일 웹/PWA)
- 로그인 없이 편집 링크로 접속
- 매니저 사진, 매장 정보, 카톡 링크 입력
- 상품 최대 6개 등록 (사진 + 정가/할인율 → 판매가 자동 계산)

### 고객 (모바일 웹)
- 링크로 전단지 읽기 전용 열람
- 상품 클릭 시 상세 모달
- 카카오톡으로 문의하기 CTA

## 기술 스택

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router v7
- **Testing**: Vitest + React Testing Library
- **Backend (실사용)**: Supabase (DB + Storage + Edge Functions)

## 시작하기

### 개발 서버 실행
\`\`\`bash
npm install
npm run dev
\`\`\`

### 테스트 실행
\`\`\`bash
npm test
\`\`\`

### 빌드
\`\`\`bash
npm run build
\`\`\`

## 프로젝트 구조

\`\`\`
src/
├── lib/
│   ├── price.ts       # 가격 계산 유틸
│   ├── slug.ts        # Slug 생성/검증 유틸
│   └── storage.ts     # localStorage 저장소 어댑터
├── types/
│   └── index.ts       # TypeScript 타입 정의
├── pages/
│   ├── admin/         # 관리자 페이지
│   ├── manager/       # 매니저 편집 페이지
│   └── public/        # 고객 전단지 페이지
└── App.tsx            # 라우팅 설정
\`\`\`

## URL 구조

| 경로 | 설명 |
|------|------|
| `/admin` | 관리자 대시보드 |
| `/admin/requests` | 신청 관리 |
| `/admin/vendors` | 거래처 관리 |
| `/admin/vendors/:id` | 거래처 상세 |
| `/admin/tickets` | 문의 관리 |
| `/edit/:token` | 매니저 편집 페이지 |
| `/s/:slug` | 고객 전단지 페이지 |

## Supabase 연동 (실사용)

프로토타입은 localStorage로 동작합니다. 실사용을 위해서는:

1. Supabase 프로젝트 생성
2. `supabase/migrations/001_initial_schema.sql` 실행
3. Storage 버킷 `flyers` 생성
4. Edge Functions 배포
5. Google Form 연동 설정

자세한 내용은 `docs/GOOGLE_FORM_INTEGRATION.md` 참조.

## 데모 데이터

관리자 대시보드에서 "데모 데이터 생성" 버튼을 클릭하면 테스트용 신청 데이터가 생성됩니다.

## 라이선스

MIT

