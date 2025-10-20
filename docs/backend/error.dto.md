# error.dto.ts

#### 🎯 목적

#### 🔎 코드 구조
##### 1. ErrorResponseDto : 일반 에러 응답
```js
export class ErrorResponseDto {
  statusCode: number;  // HTTP 상태 코드 (400, 404, 500 등)
  message: string;     // 에러 메시지
  error: string;       // 에러 타입 (Bad Request, Not Found 등)
}
```

##### 2. ValidationErrorDto : 검증 실패 에러(422)
```js
export class ValidationErrorDto {
  statusCode: number;  // 항상 422
  message: string;     // "입력 데이터 검증 실패"
  errors: Array<{
    field: string;     // 문제가 있는 필드명
    message: string;   // 해당 필드의 에러 메시지
  }>;
}
```

#### 실제 에러 응답 예시
요청 :
```shell
POST /api/auth/register
{
  "email": "invalid-email",
  "username": "ab",
  "password": "weak"
}
```

응답 :
```json
{
  "statusCode": 422,
  "message": "입력 데이터 검증 실패",
  "errors": [
    {
      "field": "email",
      "message": "유효한 이메일 주소가 아닙니다"
    },
    {
      "field": "username",
      "message": "사용자명은 3자 이상이어야 합니다"
    },
    {
      "field": "password",
      "message": "비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다"
    }
  ]
}
```

#### 🤷🏻‍♂️ OpenAPI 스펙에서의 사용 예시
```js
// Controller에서 Swagger 문서화
@ApiResponse({ 
  status: 404, 
  description: '게시글을 찾을 수 없음',
  type: ErrorResponseDto  // ← 여기서 사용
})
@ApiResponse({ 
  status: 422, 
  description: '입력 데이터 검증 실패',
  type: ValidationErrorDto  // ← 여기서 사용
})
```