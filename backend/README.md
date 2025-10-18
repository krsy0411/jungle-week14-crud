# 게시판 CRUD 프로젝트 - Backend

OpenAPI 3.0.3 스펙 기반으로 구현된 RESTful API 서버입니다.

## 기술 스택

- **Framework**: NestJS 9.0
- **Database**: PostgreSQL 16 + TypeORM
- **Cache**: Redis 7
- **Authentication**: JWT (Passport)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger UI
- **Testing**: Jest

## 프로젝트 구조

```
src/
├── modules/
│   ├── auth/          # 인증 모듈
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/         # 사용자 모듈
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── posts/         # 게시글 모듈
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts
│   │   └── posts.module.ts
│   └── comments/      # 댓글 모듈
│       ├── dto/
│       ├── entities/
│       ├── comments.controller.ts
│       ├── comments.service.ts
│       └── comments.module.ts
├── common/            # 공통 모듈
│   ├── decorators/
│   └── dto/
├── app.module.ts
└── main.ts
```

#### 커스텀 데코레이터
- [current-user.decorator.ts](/backend/docs/current-user-decorator.md)
- [pagination.dto.ts](/backend/docs/pagination.dto.md)

### 기본 내용

#### Configuration 관련 내용
- [ConfigService](/backend/docs/config-service.md)
- [useFactory](/backend/docs/use-factory.md)

#### DTO & Entity, Service & Controller
- [DTO & Entity](/backend/docs/dto-and-entity.md)
- [Service & Controller](/backend/docs/service-and-controller.md)

#### JWT 관련 내용
- [JwtStrategy](/backend/docs/jwt.strategy.md)
- [JwtAuthGuard](/backend/docs/jwt-auth-guard.md)
- [Passport](/backend/docs/passport.md)

---

## 환경 설정

### 1. 환경 변수 설정

`.env.development` 파일을 생성하고 다음 내용을 입력합니다:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=board_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173
```

### 2. PostgreSQL 데이터베이스 생성

```bash
# PostgreSQL에 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE board_db;

# 종료
\q
```

## 설치 및 실행

### 로컬 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (hot-reload)
npm run start:dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## API 문서

서버 실행 후 다음 URL에서 Swagger UI를 통해 API 문서를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs-json

## API 엔드포인트

### 인증 (Auth)

- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보 조회 (인증 필요)

### 게시글 (Posts)

- `GET /api/posts` - 게시글 목록 조회 (페이지네이션, 검색)
- `POST /api/posts` - 게시글 작성 (인증 필요)
- `GET /api/posts/:postId` - 게시글 상세 조회
- `PATCH /api/posts/:postId` - 게시글 수정 (인증 필요, 작성자만)
- `DELETE /api/posts/:postId` - 게시글 삭제 (인증 필요, 작성자만)

### 댓글 (Comments)

- `GET /api/posts/:postId/comments` - 댓글 목록 조회
- `POST /api/posts/:postId/comments` - 댓글 작성 (인증 필요)
- `PATCH /api/comments/:commentId` - 댓글 수정 (인증 필요, 작성자만)
- `DELETE /api/comments/:commentId` - 댓글 삭제 (인증 필요, 작성자만)

### 사용자 (Users)

- `GET /api/users/:userId` - 사용자 정보 조회
- `GET /api/users/:userId/posts` - 사용자가 작성한 게시글 목록

## 인증 방법

JWT Bearer Token을 사용합니다.

```bash
# 1. 회원가입
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "SecurePass123!"
  }'

# 2. 로그인 (JWT 토큰 발급)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# 3. 인증이 필요한 API 호출
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 데이터 검증 규칙

### 사용자
- **email**: 유효한 이메일 형식
- **username**: 3-20자, 영문/숫자/언더스코어/하이픈만
- **password**: 최소 8자, 대소문자/숫자/특수문자 각 1개 이상

### 게시글
- **title**: 1-50자
- **content**: 1자 이상

### 댓글
- **content**: 1-500자

## 테스트

```bash
# 단위 테스트
npm test

# e2e 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```