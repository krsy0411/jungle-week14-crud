# Docker Compose 파일

## 1. 기본 구조 및 개념

### Services(서비스)
Docker Compose에서 `services`는 애플리케이션을 구성하는 각 컨테이너를 정의합니다. 각 서비스는 독립적인 컨테이너로 실행됩니다.

## 2. 각 서비스 상세 분석

### PostgreSQL (데이터베이스)
```yaml
postgres:
  image: postgres:16-alpine
  # 컨테이너 이름을 명시적으로 지정(기본값 : 자동 생성)
  container_name: board_postgres
  # 컨테이너 내부 환경 변수
  environment:
    POSTGRES_USER: postgres # 데이터베이스 사용자명
    POSTGRES_PASSWORD: postgres # 비밀번호
    POSTGRES_DB: board_db # 초기 데이터베이스 이름
  # 데이터 영속성 보장(컨테이너가 삭제되어도 데이터 보존)
  volumes:
    - postgres_data:/var/lib/postgresql/data # postgres_data라는 named volume을 컨테이너의 /var/lib/postgresql/data에 마운트
  networks:
    - board_network
  # 서비스 건강 상태 확인
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"] # pg_isready 명령어로 PostgreSQL이 준비됐는지 확인
    interval: 10s # 10초마다
    timeout: 5s # 5초 내 응답 없으면 실패
    retries: 5 # 5번 재시도
```

### Redis (캐시/세션 저장소)
```yaml
redis:
  image: redis:7-alpine
  container_name: board_redis
  networks:
    - board_network
  # redis-cli ping 명령어로 Redis 응답 확인
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 3s
    retries: 5
  # volumes 없음: Redis는 주로 캐시/세션용이므로 영속성이 필수는 아님(필요시 AOF나 RDB 설정으로 데이터 보존 가능)
```

### Backend (NestJS API 서버)
```yaml
backend:
  # 미리 만들어진 이미지 대신 Dockerfile로 빌드
  build:
    context: ./backend # 빌드 컨텍스트(COPY 명령어 기준 경로)
    dockerfile: Dockerfile # 사용할 Dockerfile 이름
  container_name: board_backend
  # 서비스 시작 순서 및 의존성
  depends_on:
    # <condition: service_healthy> : PostgreSQL과 Redis가 완전히 준비될 때까지 대기
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
  # 애플리케이션 설정 : NestJS의 ConfigModule에서 이 환경 변수들을 읽어 사용
  environment:
    NODE_ENV: development
    DB_HOST: postgres # Docker 네트워크 내에서 서비스 이름으로 통신 (localhost 아님!)
    DB_PORT: 5432 
    DB_USERNAME: postgres
    DB_PASSWORD: postgres
    DB_DATABASE: board_db
    JWT_SECRET: dev-jwt-secret-for-local-docker
    REDIS_HOST: redis # 마찬가지로 서비스 이름 사용
    REDIS_PORT: 6379
    FRONTEND_URL: http://localhost
    PORT: 3000
  ports:
    - "3000:3000" # <호스트포트:컨테이너포트> : 로컬 3000번 포트로 접속하면 컨테이너 3000번으로 연결
  networks:
    - board_network
  restart: unless-stopped # 컨테이너가 종료되면 자동 재시작 (수동으로 중지한 경우 제외)
```

### Frontend (React + Nginx)
```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  container_name: board_frontend
  depends_on:
    - backend # 백엔드가 먼저 시작되도록 설정
  ports:
    - "80:80" # HTTP 기본 포트 : 브라우저에서 http://localhost로 접속 가능
  networks:
    - board_network
  restart: unless-stopped
```

## 3. 공통 리소스

### Volumes(볼륨)
```yaml
volumes:
  postgres_data:
```

- **Named volume**: Docker가 관리하는 영속 저장소
- PostgreSQL 데이터를 저장하여 컨테이너 재시작 후에도 데이터 유지
- 실제 위치: `/var/lib/docker/volumes/` (macOS는 Docker Desktop VM 내부)

### Networks(네트워크)
```yaml
networks:
  board_network:
    driver: bridge # 기본 네트워크 드라이버
```

- 같은 네트워크의 컨테이너끼리 서비스 이름으로 통신 가능
  - Backend에서 postgres://postgres:5432 처럼 서비스 이름 사용
  - Docker의 내장 DNS가 서비스 이름을 IP로 자동 변환
- 격리된 네트워크 환경 제공 (보안)

## 4. 실행 흐름
```markdown
1. docker-compose up -d 실행
   ↓
2. postgres 컨테이너 시작 → healthcheck 통과 대기
   ↓
3. redis 컨테이너 시작 → healthcheck 통과 대기
   ↓
4. backend 빌드 & 시작 (postgres, redis 준비 완료 후)
   ↓
5. frontend 빌드 & 시작 (backend 시작 후)
   ↓
6. 브라우저에서 http://localhost 접속
   - Nginx(frontend)가 정적 파일 제공
   - API 요청은 Nginx가 backend:3000으로 프록시
   - Backend는 postgres, redis와 통신
```