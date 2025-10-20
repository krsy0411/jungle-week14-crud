# pagenation.dto.ts

#### 🎯 목적
페이지네이션 응답의 메타 정보를 표준화하고, 게시글/댓글 목록 응답 구조를 정의합니다.

#### 🔎 코드 구조

##### 1. PaginationMetaDto : 페이지네이션 메타 정보
```js
export class PaginationMetaDto {
  total: number;       // 전체 항목 수 (예: 100개)
  page: number;        // 현재 페이지 (1부터 시작)
  limit: number;       // 페이지당 항목 수 (10개)
  totalPages: number;  // 전체 페이지 수 (10페이지)
}
```

##### 2. PostListResponseDto : 게시글 목록 응답
```js
export class PostListResponseDto {
  data: any[];                    // 게시글 배열
  meta: PaginationMetaDto;        // 페이지 정보
}
```

##### 3. CommentListResponseDto : 댓글 목록 응답
```js
export class CommentListResponseDto {
  data: any[];                    // 댓글 배열
  meta: PaginationMetaDto;        // 페이지 정보
}
```

#### 🤷🏻‍♂️ 실제 API 응답 예시
요청 :
```shell
GET /api/posts?page=2&limit=10
```

응답 :
```json
{
  "data": [
    {
      "id": 11,
      "title": "11번째 게시글",
      "content": "내용...",
      "authorId": 1,
      "author": {
        "id": 1,
        "username": "johndoe",
        "email": "user@example.com"
      },
      "commentCount": 5,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    // ... 9개 더
  ],
  "meta": {
    "total": 100,        // 총 100개의 게시글
    "page": 2,           // 현재 2페이지
    "limit": 10,         // 페이지당 10개
    "totalPages": 10     // 총 10페이지
  }
}
```

#### 🤷🏻‍♂️ 사용 예시
```js
// posts.service.ts
async findAll(page = 1, limit = 10, search?: string) {
  const skip = (page - 1) * limit;
  
  const [data, total] = await this.postRepository.findAndCount({
    skip,
    take: limit,
    order: { createdAt: 'DESC' },
  });

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),  // ✅ 계산
    },
  };
}
```