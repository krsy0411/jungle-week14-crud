# ConfigService

## ConfigService란?
NestJS의 `@nestjs/config` 패키지에서 제공하는 **환경 변수 관리 서비스**입니다.

핵심 기능은 다음과 같습니다 :
- 환경 변수(.env 파일)를 타입 안전하게 읽기
- 기본값(fallback) 제공
- 애플리케이션 전역에서 설정 값 접근

## ConfigService를 사용하는 이유
1. ConfigService를 안 사용하는 경우 (process.env 직접 사용) :
  ```js
  const dbHost = process.env.DB_HOST || 'localhost';
  ```

  이럴 경우 다음 문제들이 존재합니다 :
  - 타입 안정성 X : 항상 `string | undefined`
  - 환경 변수 누락 시 런타임에서만 발견됨
  - 테스트 어려움
  - 중복 코드

2. ConfigService를 사용하는 경우 :
  ```js
  const dbHost = configService.get<string>('DB_HOST', 'localhost');
  ```

  다음 장점들이 존재합니다 :
  - 타입 안전성 : 제네릭으로 타입 지정
  - 의존성 주입으로 테스트 용이
  - 중앙 집중식 관리
  - 환경별 설정 파일 자동 로드

## 실행 시점

### 애플리케이션 부트스트랩 순서
```markdown
1. main.ts 실행
   ↓
2. AppModule 로드
   ↓
3. ConfigModule.forRoot() 실행
   - .env 파일 읽기 (NODE_ENV에 따라 .env.development 또는 .env.production)
   - 환경 변수 파싱 및 메모리 로드
   ↓
4. TypeOrmModule.forRootAsync() 실행
   - ConfigService를 useFactory에 주입
   - DB 연결 설정 값 가져오기
   - PostgreSQL 연결 수립
   ↓
5. AuthModule 로드
   - JwtModule.registerAsync() 실행
   - ConfigService로 JWT_SECRET 가져오기
   ↓
6. JwtStrategy 인스턴스 생성
   - ConfigService 주입
   - JWT 검증 설정 완료
   ↓
7. 애플리케이션 시작 (포트 3000 리스닝)
```

### 런타임 시점
- **요청마다** : JwtStrategy의 `validate()` 메서드에서 JWT 검증 시 사용
- **DB 쿼리마다**: TypeORM이 설정된 DB 연결 정보 사용