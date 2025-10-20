# useFactory

## useFactory란?
NestJS의 동적 모듈(Dynamic Module)설정에서 사용하는 Provider 생성 패턴 중 하나입니다.
- 함수를 통해 Provider의 값을 동적으로 생성
- 다른 Provider(서비스)에 의존하여 설정 값을 계산
- 비동기 초기화가 필요한 경우에 필수

## 사용하는 이유
**정적 설정**에는 한계가 존재하기 때문입니다.

1. forRoot() 동기 방식
```js
// 사용하면 안되는 코드
TypeOrmModule.forRoot({
  host: process.env.DB_HOST,  // ⚠️ 환경 변수가 아직 로드 안 됨
  port: parseInt(process.env.DB_PORT),
})
```

문제점은 다음과 같습니다 :
- ConfigModule이 환경 변수를 로드하기 전에 실행될 수 있음
- process.env는 타입 안전성 없음 (항상 `string | undefined`)
- ConfigService의 기본값, 검증 기능 사용 불가

2. forRootAsync() + useFactory
```js
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],      // 1️⃣ 의존하는 모듈 가져오기
  inject: [ConfigService],       // 2️⃣ 주입받을 Provider 지정
  useFactory: (configService: ConfigService) => ({  // 3️⃣ 팩토리 함수
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
  }),
})
```

장점은 다음과 같습니다 :
- ConfigService가 완전히 초기화된 후 실행 보장
- 타입 안전성 확보
- 기본값 제공 가능
- 복잡한 로직 작성 가능

## useFactory 동작 원리
```markdown
# 실행 순서 다이어그램
[애플리케이션 시작]
    ↓
1. ConfigModule.forRoot() 실행
   - .env 파일 파싱
   - ConfigService 인스턴스 생성
   - 환경 변수 메모리에 로드
    ↓
2. TypeOrmModule.forRootAsync() 평가 시작
    ↓
3. imports: [ConfigModule] 확인
   - ConfigModule이 이미 로드됨을 확인
    ↓
4. inject: [ConfigService] 처리
   - NestJS DI 컨테이너에서 ConfigService 인스턴스 찾기
   - ConfigService가 완전히 초기화됨을 확인
    ↓
5. useFactory 함수 실행
   - ConfigService를 인자로 받아 호출
   - configService.get() 메서드로 환경 변수 읽기
   - 설정 객체 반환
    ↓
6. 반환된 객체로 TypeORM 초기화
   - PostgreSQL 연결 시도
   - 연결 성공 시 다음 단계 진행
```