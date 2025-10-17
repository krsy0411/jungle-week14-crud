# Fullstack CRUD 게시판 프로젝트

간단한 게시판 CRUD 애플리케이션 - NestJS 백엔드 + React 프론트엔드

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

## 빠른 시작

### 1. Docker Compose로 전체 스택 실행 (권장)

```bash
# 프로젝트 루트에서
docker-compose up --build
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

## Docker 베스트 프랙티스 적용 사항

### 1. 멀티스테이지 빌드
- **빌드 스테이지**: 의존성 설치 및 애플리케이션 빌드
- **프로덕션 스테이지**: 최소한의 런타임만 포함
- **효과**: 이미지 크기 감소 (평균 60-70% 감소)

### 2. 보안 강화
- ✅ 비루트 사용자로 실행 (`USER nestjs`, `USER nginx`)
- ✅ 최신 Alpine Linux 베이스 이미지 (node:20-alpine, nginx:alpine)
- ✅ 패키지 자동 업데이트 (`apk upgrade`)
- ✅ `.dockerignore`로 민감한 파일 제외

### 3. 레이어 캐싱 최적화
- package.json을 먼저 복사하여 의존성 레이어 캐싱
- 소스 코드는 마지막에 복사

### 4. 헬스체크 구성
- PostgreSQL과 Redis에 헬스체크 설정
- 서비스 간 의존성 순서 보장 (`depends_on` with `condition`)

## 취약점 관리 권장사항

현재 베이스 이미지에서 일부 취약점이 보고될 수 있습니다. 이는 업스트림 이미지 자체의 문제로, 다음 방법으로 완화할 수 있습니다:

### 1. 정기적인 이미지 업데이트
```bash
# 최신 보안 패치가 적용된 이미지로 재빌드
docker-compose build --no-cache
docker-compose up -d
```

### 2. 취약점 스캔 자동화
```bash
# Trivy로 이미지 스캔
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image fullstack-crud-backend:latest

# 또는 Docker Scout 사용 (Docker Desktop에 내장)
docker scout cves fullstack-crud-backend:latest
```

### 3. CI/CD에 보안 스캔 추가
- GitHub Actions에 Trivy 또는 Snyk 통합
- Dependabot으로 의존성 자동 업데이트

### 4. 프로덕션 배포 시 추가 권장사항
- **이미지 서명**: Docker Content Trust 활성화
- **런타임 보안**: AppArmor/SELinux 프로필 적용
- **네트워크 격리**: 서비스별 전용 네트워크 사용
- **시크릿 관리**: Docker Secrets 또는 Vault 사용

## 추가 Docker 기능 권장사항

### 1. BuildKit 활성화 (빌드 성능 향상)
```bash
DOCKER_BUILDKIT=1 docker-compose build
```

### 2. 개발 환경용 볼륨 마운트
개발 시 핫 리로드를 위한 docker-compose.dev.yml:
```yaml
services:
  backend:
    volumes:
      - ./backend/src:/usr/src/app/src
  frontend:
    volumes:
      - ./frontend/src:/usr/src/app/src
```

### 3. 리소스 제한 설정
프로덕션 환경에서:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## 환경 변수 설정

`.env` 파일 예시 (루트 디렉터리):
```env
# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=board_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# Node
NODE_ENV=production
PORT=3000
```

⚠️ **주의**: `.env` 파일은 절대 Git에 커밋하지 마세요. `.env.example`을 제공하세요.

## 테스트 실행

```bash
# 백엔드 테스트
cd backend
npm test

# 프론트엔드 테스트
cd frontend
npm test

# E2E 테스트
npm run test:e2e
```

---

상세 기술 스택 및 아키텍처는 `.github/copilot-instructions.md`를 참조하세요.
