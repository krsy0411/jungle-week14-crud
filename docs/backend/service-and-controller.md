# Service & Controller

## Controller란?
HTTP 요청을 처리하는 진입점(Entry Point)입니다.

### 핵심 개념
- 클라이언트의 HTTP 요청을 받아서 처리
- 요청 데이터를 추출하고 검증
- Service를 호출하여 비즈니스 로직 실행
- 응답을 클라이언트에게 반환
- 프레젠테이션 계층(Presentation Layer)

### MVC 패턴에서의 역할
```markdown
Client (HTTP 요청)
    ↓
Controller (요청 처리, 라우팅)
    ↓
Service (비즈니스 로직)
    ↓
Repository (데이터베이스)
    ↓
Service (결과 반환)
    ↓
Controller (HTTP 응답)
    ↓
Client (응답 수신)
```

## Service란?
비즈니스 로직을 담당하는 계층입니다.

### 핵심 개념
- 실제 비즈니스 로직 구현
- 데이터베이스 접근 (Repository 사용)
- 데이터 변환 및 가공
- 예외 처리
- 비즈니스 로직 계층(Business Logic Layer)

## Controller와 Service 비교
| 측면 | Controller | Service |
| --- | ---------- | ------- |
| 책임 | HTTP 요청/응답 처리 | 비즈니스 로직 |
| 의존성 | Service 의존 | Repository 의존 |
| 주요 작업 | 라우팅, 데이터 추출, 검증 | 데이터 처리, DB 접근 |
| 데코레이터 | `@Controller`, `@Get`, `@Post`	| `@Injectable` |
| 테스트 | E2E 테스트 | Unit 테스트 |
| 재사용성 | 낮음 (HTTP 의존) | 높음 (독립적) |
| 에러 처리 | HTTP Exception | Business Exception |

## 전체 요청 흐름 예시

### 게시글 작성 시나리오
```markdown
[클라이언트]
POST /posts
Authorization: Bearer eyJhbGciOiJ...
{
  "title": "NestJS 배우기",
  "content": "NestJS는 훌륭합니다."
}
    ↓
[1. Middleware/Guard]
- JwtAuthGuard 실행
- 토큰 검증
- request.user에 User 객체 설정
    ↓
[2. Controller - posts.controller.ts:48-52]
@Post()
@UseGuards(JwtAuthGuard)
async create(
  @Body() createPostDto: PostCreateRequestDto,  // DTO 검증
  @CurrentUser() user: User,  // JWT에서 추출
) {
  return await this.postsService.create(createPostDto, user);
}
    ↓
[3. Service - posts.service.ts:29-36]
async create(createPostDto, user) {
  const post = this.postRepository.create({
    ...createPostDto,
    authorId: user.id,
  });
  return await this.postRepository.save(post);
}
    ↓
[4. Repository]
- TypeORM이 SQL 생성
INSERT INTO posts (title, content, author_id, created_at, updated_at)
VALUES ('NestJS 배우기', '...', 1, NOW(), NOW())
RETURNING *;
    ↓
[5. Database]
- PostgreSQL에서 실행
- 새 행 생성
- id, createdAt, updatedAt 자동 생성
    ↓
[6. Service → Controller]
- Entity 반환
{
  id: 1,
  title: "NestJS 배우기",
  content: "...",
  authorId: 1,
  author: { ... },
  createdAt: "...",
  updatedAt: "..."
}
    ↓
[7. ClassSerializerInterceptor]
- UserResponseDto로 변환
- author.password 제외
    ↓
[8. 클라이언트 응답]
HTTP/1.1 201 Created
{
  "id": 1,
  "title": "NestJS 배우기",
  "content": "NestJS는 훌륭합니다.",
  "authorId": 1,
  "author": {
    "id": 1,
    "username": "johndoe",
    "email": "user@example.com"
    // password 제외됨
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## 아키텍처 레이어
```markdown
┌─────────────────────────────────────┐
│  Presentation Layer                 │
│  - Controller                       │
│  - Guard, Interceptor, Pipe         │
│  - DTO (Request/Response)           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Business Logic Layer               │
│  - Service                          │
│  - Domain Logic                     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Data Access Layer                  │
│  - Repository                       │
│  - Entity                           │
│  - TypeORM                          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Database (PostgreSQL)              │
└─────────────────────────────────────┘
```