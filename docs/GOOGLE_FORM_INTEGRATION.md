# Google Form 연동 가이드

## 개요
Google Form에서 거래처 신청을 받으면 자동으로 Supabase에 저장되어 관리자 대시보드에서 확인할 수 있습니다.

## 1. Google Form 설정

### 필수 필드
| 필드명 | 설명 | 필수 |
|--------|------|------|
| 매장명 (shopName) | 신청 매장 이름 | ✅ |
| 담당자명 (managerName) | 담당자 성함 | ✅ |
| 연락처 (contact) | 전화번호 | ✅ |
| 이메일 (email) | 이메일 주소 | ❌ |
| 메모 (memo) | 추가 요청사항 | ❌ |

## 2. Google Apps Script 설정

1. Google Form 편집 화면에서 **⋮ > 스크립트 편집기** 클릭
2. 아래 코드를 붙여넣기:

```javascript
const WEBHOOK_URL = 'https://lfobdgnfpanykbrepszs.supabase.co/functions/v1/google-form-webhook';

function onFormSubmit(e) {
  const responses = e.namedValues;
  
  const payload = {
    shopName: getValue(responses, '매장명'),
    managerName: getValue(responses, '담당자명'),
    contact: getValue(responses, '연락처'),
    email: getValue(responses, '이메일'),
    memo: getValue(responses, '메모'),
  };
  
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    Logger.log('Response: ' + response.getContentText());
  } catch (error) {
    Logger.log('Error: ' + error.toString());
  }
}

function getValue(responses, fieldName) {
  const value = responses[fieldName];
  return value ? value[0] : '';
}
```

3. **저장** 클릭

## 3. 트리거 설정

1. 왼쪽 메뉴에서 **⏰ 트리거** 클릭
2. **+ 트리거 추가** 클릭
3. 다음과 같이 설정:
   - 실행할 함수: `onFormSubmit`
   - 이벤트 소스: **스프레드시트에서**
   - 이벤트 유형: **양식 제출 시**
4. **저장** 클릭
5. Google 계정 권한 승인

## 4. 테스트

### 수동 테스트 (curl)
```bash
curl -X POST 'https://lfobdgnfpanykbrepszs.supabase.co/functions/v1/google-form-webhook' \
  -H 'Content-Type: application/json' \
  -d '{
    "shopName": "테스트 매장",
    "managerName": "홍길동",
    "contact": "010-1234-5678",
    "email": "test@example.com",
    "memo": "테스트 신청입니다"
  }'
```

### 예상 응답
```json
{
  "success": true,
  "id": "uuid-..."
}
```

## 5. 관리자 대시보드 확인

신청이 접수되면:
1. 관리자 대시보드 `/admin` 에서 확인
2. **신청 관리** 메뉴에 빨간 배지로 신규 신청 표시
3. 신청 승인 시 자동으로 거래처 생성 + 편집 링크 발급

## 트러블슈팅

### 에러: "Missing required fields"
- 필수 필드(shopName, managerName, contact)가 비어있는지 확인
- Google Form 필드명이 스크립트와 일치하는지 확인

### 에러: "Failed to create request"
- Supabase 대시보드에서 Edge Function 로그 확인
- RLS 정책 확인

### 알림이 안 뜸
- notifications 테이블 RLS 정책 확인
- 관리자 대시보드 새로고침
