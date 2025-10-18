# JwtAuthGuard

## JwtAuthGuard란?
JWT 토큰 기반 인증을 처리하는 Guard

### 핵심 개념
- **NestJS의 Guard**: 요청이 Controller에 도달하기 전에 실행되는 보안 계층
- **JWT (JSON Web Token)** 검증
- 인증된 사용자만 특정 엔드포인트에 접근 가능하도록 제어
- Passport.js의 JWT Strategy 활용

## JwtAuthGuard를 사용하는 이유

### ❌ Guard 없이 인증 구현 시
```js
@Post()
async create(@Headers('authorization') auth: string, @Body() dto: PostCreateRequestDto) {
  // 1. 토큰 추출
  const token = auth?.split(' ')[1];
  if (!token) {
    throw new UnauthorizedException('토큰이 없습니다');
  }
  
  // 2. 토큰 검증
  let payload;
  try {
    payload = this.jwtService.verify(token);
  } catch (error) {
    throw new UnauthorizedException('유효하지 않은 토큰입니다');
  }
  
  // 3. 사용자 조회
  const user = await this.userRepository.findOne({ where: { id: payload.sub } });
  if (!user) {
    throw new UnauthorizedException('사용자를 찾을 수 없습니다');
  }
  
  // 4. 드디어 비즈니스 로직...
  return await this.postsService.create(dto, user);
}
```

문제점은 다음과 같습니다 :
1. **코드 중복** : 모든 인증 필요 엔드포인트에 동일 코드 반복
2. **유지보수 어려움** : 인증 로직 변경 시 모든 곳 수정
3. **관심사 분리 위반** : Controller가 인증 + 비즈니스 로직 모두 처리
4. **보안 취약** : 한 곳이라도 빠뜨리면 보안 구멍

### ✅ JwtAuthGuard 사용 시
```js
@Post()
@UseGuards(JwtAuthGuard)  // 한 줄로 인증 완료!
async create(@Body() dto: PostCreateRequestDto, @CurrentUser() user: User) {
  return await this.postsService.create(dto, user);
}
```

장점은 다음과 같습니다 :
1. 선언적 코드 : `@UseGuards()` 한 줄로 인증 표현
2. 재사용성 : 모든 엔드포인트에서 동일한 Guard 사용
3. 관심사 분리 : 인증 로직과 비즈니스 로직 분리
4. 일관성 : 모든 인증이 동일한 방식으로 처리
5. 보안 강화 : 중앙 집중식 관리로 누락 방지

## JwtAuthGuard 실행 시점

### 전체 실행 흐름
```markdown
[1. 클라이언트 요청]
POST /posts
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
{ "title": "...", "content": "..." }
    ↓
[2. NestJS 요청 수신]
    ↓
[3. ⭐ JwtAuthGuard 실행 (Controller 메서드 전)]
    ├─ 3-1. ExtractJwt.fromAuthHeaderAsBearerToken()
    │       - Authorization 헤더에서 토큰 추출
    │       - "Bearer eyJhbGci..." → "eyJhbGci..."
    │
    ├─ 3-2. JWT 검증 (passport-jwt)
    │       - 서명 검증 (JWT_SECRET 사용)
    │       - 만료 시간 확인
    │       - 토큰 구조 검증
    │
    ├─ 3-3. payload 추출
    │       { sub: 1, email: 'user@example.com' }
    │
    └─ 3-4. JwtStrategy.validate(payload) 호출
            - DB에서 사용자 조회
            - 사용자 존재 확인
            - User 객체 반환
    ↓
[4. Guard 결과 처리]
    ├─ ✅ 성공: request.user = User 객체 설정 → 다음 단계 진행
    └─ ❌ 실패: 401 Unauthorized 응답 → 요청 종료
    ↓
[5. Controller 메서드 실행]
@Post()
async create(
  @Body() dto,
  @CurrentUser() user: User,  // ← request.user에서 가져옴
) { ... }
    ↓
[6. Service → Repository → Database]
    ↓
[7. 응답 반환]
```

## JwtAuthGuard 구현 방법

### 1. JWT 토큰 생성 (로그인 시)
> _예시 : [AuthService](/backend/src/modules/auth/auth.service.ts)_의 일부 함수

```js
async login(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
  // 1. 사용자 확인
  const user = await this.usersService.findByEmail(loginDto.email);
  if (!user) {
    throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
  }

  // 2. 비밀번호 검증
  const isPasswordValid = await this.usersService.validatePassword(
    loginDto.password,
    user.password,
  );
  if (!isPasswordValid) {
    throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
  }

  // 3. JWT payload 생성
  const payload: JwtPayload = {
    sub: user.id,      // subject: 사용자 ID (JWT 표준)
    email: user.email,
  };

  // 4. JWT 토큰 생성 (서명)
  const accessToken = this.jwtService.sign(payload);

  // 5. 토큰과 사용자 정보 반환
  return {
    accessToken,
    user: { ...user, password: undefined },  // password 제외
  };
}
```

생성된 JWT 구조는 다음과 같습니다 : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoxNzA0MTUzNjAwfQ.abc123...`

```markdown
┌─────────────── Header ──────────────┐
│ { "alg": "HS256", "typ": "JWT" }    │
└─────────────────────────────────────┘
┌─────────────── Payload ─────────────┐
│ {                                   │
│   "sub": 1,                         │
│   "email": "user@example.com",      │
│   "iat": 1704067200,  // 발급 시각    │
│   "exp": 1704153600   // 만료 시각    │
│ }                                   │
└─────────────────────────────────────┘
┌─────────────── Signature ───────────┐
│ HMACSHA256(                         │
│   base64UrlEncode(header) + "." +   │
│   base64UrlEncode(payload),         │
│   JWT_SECRET                        │
│ )                                   │
└─────────────────────────────────────┘
```

### 2. JwtStrategy 설정
> _[JwtStrategy](/backend/src/modules/auth/strategies/jwt.strategy.ts)_

```js
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      // 토큰 추출 방법
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // 만료된 토큰 처리
      ignoreExpiration: false,  // false: 만료 시 에러 발생
      
      // 서명 검증 키 (환경 변수에서 로드)
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // 토큰 검증 후 실행되는 메서드
  async validate(payload: JwtPayload): Promise<User> {
    // payload = { sub: 1, email: "user@example.com" }
    
    // DB에서 사용자 조회
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('인증이 필요합니다');
    }

    // 반환된 user 객체가 request.user에 저장됨
    return user;
  }
}
```

### 3. JwtAuthGuard 생성
> _[JwtAuthGuard](/backend/src/modules/auth/guards/jwt-auth.guard.ts)_

```js
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### 4. Module에 등록
> _[AuthModule](/backend/src/modules/auth/auth.module.ts)_

```js
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },  // 토큰 만료 시간
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],  // ← JwtStrategy 등록!
  exports: [AuthService],
})
export class AuthModule {}
```

### 5. Controller에서 사용
```js
@Post()
@UseGuards(JwtAuthGuard)  // ← Guard 적용
async create(
  @Body() dto: PostCreateRequestDto,
  @CurrentUser() user: User,  // ← Guard가 설정한 user
) {
  return await this.postsService.create(dto, user);
}
```

## 실행 흐름
> _시나리오 : 게시글 작성 요청_

```markdown
[클라이언트]
POST /posts
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoxNzA0MTUzNjAwfQ.K_signature
{
  "title": "NestJS 배우기",
  "content": "..."
}
    ↓
┌──────────────────────────────────────────────────────────┐
│ [1] NestJS Request Pipeline                              │
│     - Middleware 실행                                     │
│     - Global Guards 실행 (있다면)                           │
└──────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────┐
│ [2] @UseGuards(JwtAuthGuard) 발견                         │
│     - Controller 메서드 실행 전 Guard 호출                    │
└──────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────┐
│ [3] JwtAuthGuard.canActivate() 실행                       │
│     (AuthGuard('jwt') 내부)                               │
│                                                          │
│     3-1. Passport.authenticate('jwt') 호출                │
│          - 'jwt' Strategy 찾기 → JwtStrategy 발견          │
└──────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────┐
│ [4] 토큰 추출 (passport-jwt 라이브러리)                       │
│                                                          │
│     ExtractJwt.fromAuthHeaderAsBearerToken()             │
│     - Header: "Authorization: Bearer eyJhbGci..."        │
│     - 결과: "eyJhbGci..."                                 │
└──────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────┐
│ [5] JWT 검증 (jsonwebtoken 라이브러리)                       │
│                                                          │
│     jwt.verify(token, JWT_SECRET)                        │
│                                                          │
│     5-1. 서명 검증                                         │
│          - 토큰의 서명 = HMAC(header + payload, secret)     │
│          - 계산한 서명 === 토큰의 서명? ✅ 통과                 │
│                                                          │
│     5-2. 만료 확인                                         │
│          - exp: 1704153600                               │
│          - 현재: 1704100000                               │
│          - 현재 < exp? ✅ 통과                             │
│                                                          │
│     5-3. 구조 검증                                         │
│          - Header, Payload, Signature 존재? ✅ 통과        │
│                                                          │
│     결과: { sub: 1, email: "user@example.com" }           │
└──────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────┐
│ [6] JwtStrategy.validate(payload) 호출                    │
│                                                          │
│     async validate(payload: JwtPayload) {                │
│       // payload = { sub: 1, email: "..." }              │
│                                                          │
│       const user = await userRepository.findOne({        │
│         where: { id: payload.sub }  // id = 1            │
│       });                                                │
│                                                          │
│       if (!user) {                                       │
│         throw new UnauthorizedException();               │
│       }                                                  │
│                                                          │
│       return user;  // ← 중요!                            │
│     }                                                    │
│                                                          │
│     DB 쿼리 실행:                                          │
│     SELECT * FROM users WHERE id = 1;                    │
│                                                          │
│     결과: User {                                          │
│       id: 1,                                             │
│       email: "user@example.com",                         │
│       username: "johndoe",                               │
│       password: "hashed...",                             │
│       createdAt: "...",                                  │
│       updatedAt: "..."                                   │
│     }                                                    │
└──────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────┐
│ [7] Guard 결과 처리                                        │
│                                                          │
│     request.user = User {                                │
│       id: 1,                                             │
│       email: "user@example.com",                         │
│       username: "johndoe",                               │
│       ...                                                │
│     }                                                    │
│                                                          │
│     canActivate() 반환값: true ✅                          │
└──────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────┐
│ [8] Controller 메서드 실행                                  │
│                                                          │
│     @Post()                                              │
│     async create(                                        │
│       @Body() dto,                                       │
│       @CurrentUser() user: User  // ← request.user 주입   │
│     ) {                                                  │
│       return await this.postsService.create(dto, user);  │
│     }                                                    │
│                                                          │
│     user = {                                             │
│       id: 1,                                             │
│       email: "user@example.com",                         │
│       username: "johndoe",                               │
│       ...                                                │
│     }                                                    │
└──────────────────────────────────────────────────────────┘
    ↓
[Service → Repository → DB → Response]
```