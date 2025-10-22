## 빠른 시작

### 1. Docker Compose로 전체 스택 실행 (권장)

#### 백엔드 인프라 시작
```bash
docker-compose up postgres redis backend
```

#### 프론트엔드 로컬에서 개발 서버 실행
```bash
cd frontend
```

```bash
npm run dev
```

- 백엔드: http://localhost:3000
- 프론트엔드: http://localhost:80
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 2. 로컬 개발 모드

#### 백엔드 개발

```bash
cd backend
npm install
npm run start:dev
```

개발 서버가 http://localhost:3000 에서 실행됩니다.

#### 프론트엔드 개발

```bash
cd frontend
npm install
npm run dev
```

개발 서버가 http://localhost:5173 에서 실행됩니다.

## 프로젝트 구조

```
.
├── backend/                # NestJS 백엔드
│   ├── src/
│   │   ├── modules/       # 기능별 모듈
│   │   │   ├── auth/      # 인증/인가
│   │   │   ├── users/     # 사용자 관리
│   │   │   ├── posts/     # 게시글 CRUD
│   │   │   └── comments/  # 댓글 CRUD
│   │   ├── common/        # 공통 유틸리티
│   │   ├── config/        # 설정 파일
│   │   └── main.ts        # 엔트리포인트
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
├── frontend/              # React 프론트엔드
│   ├── src/
│   │   ├── components/    # 재사용 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── hooks/         # 커스텀 훅
│   │   ├── services/      # API 클라이언트
│   │   ├── styles/        # 전역 스타일
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── nginx/                 # Nginx 설정
├── .github/workflows/     # CI/CD 파이프라인
└── docker-compose.yml     # 통합 오케스트레이션

```

---

상세 기술 스택 및 아키텍처는 `.github/copilot-instructions.md`를 참조하세요.
