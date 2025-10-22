# 정글 10기 | 실력 다지기 프로젝트 - 풀스택 CRUD 애플리케이션

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

## 아키텍처
![아키텍처](./assets/img/architecture.png)

## 문서

### 개요
- [기술 스택](./docs/stack.md)
- [프로젝트 구조 및 실행 방법](./docs/about-project.md)

### 프론트엔드
- [Axios : 인터셉터](./docs/frontend/axios-interceptor.md)
- [Infinite Scroll](./docs/frontend/infinite-scroll.md)
- [React 최적화](./docs/frontend/react-optimization.md)
- [useEffect Cleanup](./docs/frontend/useEffect-cleanup.md)

### 백엔드
- [ConfigService](./docs/backend/config-service.md)
- [CurrentUser Decorator](./docs/backend/current-user-decorator.md)
- [DTO & Entity](./docs/backend/dto-and-entity.md)
- [Service & Controller](./docs/backend/service-and-controller.md)
- [JwtAuthGuard](./docs/backend/jwt-auth-guard.md)
- [Jwt Strategy](./docs/backend/jwt.strategy.md)
- [Passport](./docs/backend/passport.md)
- [useFactory](./docs/backend/use-factory.md)