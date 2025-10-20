# DTO & Entity

## Entity란?
데이터베이스 테이블과 1:1로 매핑되는 클래스

### 핵심 개념
- TypeORM의 데코레이터로 테이블 구조 정의
- 데이터베이스의 실제 스키마를 코드로 표현
- 영속성 계층(Persistence Layer)의 핵심
- ORM이 이 클래스를 기반으로 SQL 자동 생성

## DTO(Data Transfer Object)란?
계층 간 데이터 전송을 위한 계층

### 핵심 개념
- 클라이언트 ↔ 서버 간 데이터 교환 형식 정의
- 입력 검증 (Validation)
- API 문서 자동 생성 (Swagger)
- 민감한 정보 제외 가능(보안)

## Entity와 DTO 비교
| 측면 | Entity | DTO |
| --- | ------ | --- |
| 목적 | DB 테이블 매핑 | 데이터 전송 |
| 위치 | 영속성 계층 | 프레젠테이션 계층 |
| 사용처 | Repository, DB 쿼리 | Controller, API 응답/요청 |
| 데코레이터 | `@Entity`, `@Column` 등 | `@IsString`, `@ApiProperty` 등 |
| 변경 빈도 | 낮음 (스키마 변경 시) | 높음 (API 요구사항 변경 시) |
| 검증 | DB 제약조건 | class-validator |
| 관계 | `@OneToMany`, `@ManyToOne` | 중첩된 DTO 참조 |

## Entity와 DTO의 실제 흐름

### 사용자 생성 시나리오
```markdown
[클라이언트 요청]
POST /auth/register
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}
    ↓
[Controller] UserCreateRequestDto 검증
    ↓ (검증 통과)
[Service] Entity 생성
const user = userRepository.create({
  ...createUserDto,  // DTO → Entity 변환
  password: hashedPassword,
});
await userRepository.save(user);  // DB 저장
    ↓
[DB] INSERT INTO users ...
    ↓
[Service] Entity 반환
return user;  // User Entity
    ↓
[Controller] ClassSerializerInterceptor
UserResponseDto로 변환 (password 제외)
    ↓
[클라이언트 응답]
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### 게시글 목록 조회 시나리오
```markdown
[클라이언트 요청]
GET /posts?page=1&limit=10
    ↓
[Controller] Query 파라미터 파싱
    ↓
[Service] Repository 조회
const [posts, total] = await postRepository.findAndCount({
  skip: 0,
  take: 10,
  relations: ['author'],  // Entity 관계 로드
});
    ↓
[DB] SELECT * FROM posts 
     LEFT JOIN users ON posts.author_id = users.id
     LIMIT 10 OFFSET 0;
    ↓
[Service] DTO 변환
return {
  data: posts.map(post => ({
    ...post,
    author: { ...post.author },  // User Entity → UserResponseDto
  })),
  meta: { total, page, limit, totalPages },
};
    ↓
[Controller] PostListResponseDto 반환
    ↓
[클라이언트 응답]
{
  "data": [
    {
      "id": 1,
      "title": "...",
      "author": {
        "id": 1,
        "username": "johndoe"
        // password 제외됨
      }
    }
  ],
  "meta": { ... }
}
```