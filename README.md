# 정글 10기 | 실력 다지기 프로젝트 - 풀스택 CRUD 애플리케이션

## 기술 스택

### 백엔드
- **프레임워크**: NestJS (TypeScript)
- **ORM**: TypeORM
- **데이터베이스**: PostgreSQL 16
- **캐시/세션**: Redis 7
- **인증**: JWT + Passport
- **API 문서**: Swagger
- **테스트**: Jest, Playwright

### 프론트엔드
- **프레임워크**: React 18 + TypeScript
- **빌드 도구**: Vite
- **라우팅**: React Router
- **상태관리**: Zustand
- **HTTP 클라이언트**: Axios
- **스타일링**: Tailwind CSS
- **테스트**: Jest, React Testing Library

### 인프라
- **컨테이너**: Docker + Docker Compose
- **웹서버**: Nginx
- **CI/CD**: GitHub Actions

## 화면

### 주요 화면

| **메인 화면** | **게시글 상세 화면** |
|:---:|:---|
| ![메인 화면](./assets/img/main.png) | ![게시글 상세](./assets/img/post-detail.png) |

### 주요 기능

| **로그인 성공** | **로그인 실패** | **회원가입 유효성 검증** |
|:---:|:---:|:---:|
| ![로그인 성공](./assets/gif/login-success.gif) | ![로그인 실패](./assets/gif/login-fail.gif) | ![회원가입 실패](./assets/gif/register-fail.gif) |

| **게시글 작성** | **게시글 수정** | **댓글 작성** |
|:---:|:---:|:---:|
| ![게시글 작성](./assets/gif/new-post.gif) | ![게시글 수정](./assets/gif/update-post.gif) | ![댓글 작성](./assets/gif/new-comment.gif) |

| **댓글 삭제** | **좋아요 기능** | **검색 기능** |
|:---:|:---:|:---:|
| ![댓글 삭제](./assets/gif/delete-comment.gif) | ![좋아요](./assets/gif/like.gif) | ![검색](./assets/gif/search.gif) |

| **정렬 기능** | **무한 스크롤** |
|:---:|:---:|
| ![정렬](./assets/gif/sort.gif) | ![무한 스크롤](./assets/gif/infinite-scroll.gif) |

