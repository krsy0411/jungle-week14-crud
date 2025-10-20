# Passport

## Passport란?
**Node.js의 인증 미들웨어**입니다.

### 핵심 개념
- **범용 인증 프레임워크** : 다양한 인증 방식을 통합된 API로 제공
- **Strategy 패턴** : 각 인증 방식을 독립적인 Strategy로 구현
- **Express/NestJS와 통합** : 미들웨어/Guard로 쉽게 적용
- **500+ Strategy** : JWT, OAuth, Local, Google, Facebook 등

### 프로젝트에서 사용하는 패키지
```json
{
  "passport": "^0.6.0",           // Passport 코어
  "passport-jwt": "^4.0.0",       // JWT Strategy
  "@nestjs/passport": "^9.0.0"    // NestJS 통합 패키지
}
```

## Passport의 구조(계층 구조)
```markdown
┌─────────────────────────────────────────────────┐
│  애플리케이션 레벨                                   │
│  - Controller                                   │
│  - @UseGuards(JwtAuthGuard)                     │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  NestJS 통합 레벨 (@nestjs/passport)              │
│  - AuthGuard('jwt')                             │
│  - PassportStrategy                             │
│  - PassportModule                               │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  Passport 코어 (passport)                        │
│  - passport.authenticate()                      │
│  - passport.use()                               │
│  - Strategy 관리                                 │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  Strategy 구현 (passport-jwt)                    │
│  - JwtStrategy                                  │
│  - 토큰 추출                                      │
│  - 토큰 검증                                      │
└─────────────────────────────────────────────────┘
```

## Passport의 핵심 개념 : Strategy 패턴

### Strategy란?
인증 방식을 캡슐화한 독립적인 모듈

### 다양한 Strategy 예시
```markdown
// 1. Local Strategy (이메일/비밀번호)
passport-local

// 2. JWT Strategy (토큰 기반)
passport-jwt  ← 프로젝트에서 사용!

// 3. OAuth2 Strategy
passport-google-oauth20
passport-facebook
passport-github

// 4. OpenID Connect
passport-openidconnect

// 5. SAML
passport-saml
```

### Strategy 패턴의 장점

#### ❌ 사용하지 않는 경우
```js
function authenticate(req) {
  if (req.authType === 'jwt') {
    // JWT 검증 로직
  } else if (req.authType === 'oauth') {
    // OAuth 로직
  } else if (req.authType === 'local') {
    // 로컬 로그인 로직
  }
  // ... 계속 추가
}
```

#### ✅ 사용하는 경우
```js
passport.use('jwt', new JwtStrategy(...));
passport.use('local', new LocalStrategy(...));
passport.use('google', new GoogleStrategy(...));

// 사용
passport.authenticate('jwt');   // JWT 검증
passport.authenticate('local'); // 로컬 로그인
passport.authenticate('google'); // Google OAuth
```

## 프로젝트에서의 Passport

### 1) PassportModule 등록
> _[AuthModule](/backend/src/modules/auth/auth.module.ts)_

```js
@Module({
  imports: [
    UsersModule,
    PassportModule,  // ← Passport 모듈 추가
    ConfigModule,
    JwtModule.registerAsync({ ... }),
  ],
  providers: [AuthService, JwtStrategy],  // ← JwtStrategy 등록
})
export class AuthModule {}
```

PassportModule의 역할 :
- Passport 기능을 NestJS에 통합
- Strategy 등록 및 관리
- AuthGuard 제공

### 2) JwtStrategy 구현
> _[JwtStrategy](/backend/src/modules/auth/strategies/jwt.strategy.ts)_

```js
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';  // ← NestJS 통합
import { ExtractJwt, Strategy } from 'passport-jwt';  // ← JWT Strategy
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      // JWT 추출 방법
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // 만료 토큰 거부
      ignoreExpiration: false,
      
      // 검증 비밀키
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // Passport가 토큰 검증 후 자동으로 호출하는 메서드
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('인증이 필요합니다');
    }

    return user;  // ← request.user에 저장됨
  }
}
```

PassportStrategy의 역할 :
- `passport-jwt`의 `Strategy`를 NestJS에 통합
- DI(의존성 주입) 가능하게 만듦
- 자동으로 Passport에 등록

### 3) JwtAuthGuard 구현
> _[JwtAuthGuard](/backend/src/modules/auth/guards/jwt-auth.guard.ts)_

```js
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';  // ← NestJS 통합

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

AuthGuard('jwt')의 역할 :
- `'jwt'` 이름의 Strategy 사용
- `canActivate()` 메서드 제공
- Passport의 `authenticate()` 호출

### 4) Controller에서 사용
```js
@Post()
@UseGuards(JwtAuthGuard)  // ← Passport 기반 Guard
async create(
  @Body() dto: PostCreateRequestDto,
  @CurrentUser() user: User,  // ← Passport가 설정한 request.user
) {
  return await this.postsService.create(dto, user);
}
```

## Passport의 내부 동작 원리

### 1) Strategy 등록 과정
```markdown
[애플리케이션 시작]
    ↓
┌─────────────────────────────────────────────────┐
│ [1] AuthModule 로드                              │
│     - PassportModule import                     │
│     - JwtStrategy provider 등록                  │
└─────────────────┬───────────────────────────────┘
    ↓
┌─────────────────▼───────────────────────────────┐
│ [2] JwtStrategy 인스턴스 생성                       │
│                                                 │
│     @Injectable()                               │
│     export class JwtStrategy                    │
│       extends PassportStrategy(Strategy) {      │
│                                                 │
│       constructor(...) {                        │
│         super({ ... });  // ← 설정 전달           │
│       }                                         │
│     }                                           │
└─────────────────┬───────────────────────────────┘
    ↓
┌─────────────────▼───────────────────────────────┐
│ [3] PassportStrategy가 Passport에 등록            │
│     (내부적으로 실행됨)                              │ 
│                                                 │
│     passport.use('jwt', new Strategy({          │
│       jwtFromRequest: ExtractJwt.from...,       │
│       secretOrKey: 'secret',                    │
│       // validate 함수 래핑                       │
│     }));                                        │
└─────────────────┬───────────────────────────────┘
    ↓
┌─────────────────▼───────────────────────────────┐
│ [4] Strategy 등록 완료                            │
│                                                 │
│     Passport 내부 Strategy Map:                  │
│     {                                           │
│       'jwt': JwtStrategy 인스턴스                 │
│     }                                           │
└─────────────────────────────────────────────────┘
```

### 2) 인증 요청 처리 과정
```markdown
[HTTP 요청]
POST /posts
Authorization: Bearer eyJhbGci...
    ↓
┌─────────────────────────────────────────────────┐
│ [1] @UseGuards(JwtAuthGuard) 실행                │
│                                                 │
│     extends AuthGuard('jwt')                    │
└─────────────────┬───────────────────────────────┘
    ↓
┌─────────────────▼───────────────────────────────┐
│ [2] AuthGuard.canActivate() 실행                 │
│     (@nestjs/passport 내부)                      │
│                                                 │
│     async canActivate(context) {                │
│       const request = context                   │
│         .switchToHttp().getRequest();           │
│                                                 │
│       // Passport.authenticate() 호출            │
│       return passport.authenticate(             │
│         'jwt',        // ← Strategy 이름         │
│         { session: false }                      │
│       )(request);                               │
│     }                                           │
└─────────────────┬───────────────────────────────┘
    ↓
┌─────────────────▼───────────────────────────────┐
│ [3] Passport 코어가 'jwt' Strategy 찾기            │
│     (passport 라이브러리 내부)                      │
│                                                 │
│     const strategy = this._strategies['jwt'];   │
│     // JwtStrategy 인스턴스 가져오기                 │
└─────────────────┬───────────────────────────────┘
    ↓
┌─────────────────▼───────────────────────────────┐
│ [4] JwtStrategy 실행 (passport-jwt)              │
│                                                 │
│     4-1. 토큰 추출                                │
│     const token = extractFromHeader(request);   │
│     // "eyJhbGci..."                            │
│                                                 │
│     4-2. 토큰 검증 (jsonwebtoken 라이브러리)         │
│     const payload = jwt.verify(token, secret);  │
│     // { sub: 1, email: "..." }                 │
│                                                 │
│     4-3. validate() 호출                         │
│     const user = await strategy.validate(       │
│       payload                                   │
│     );                                          │
└─────────────────┬───────────────────────────────┘
    ↓
┌─────────────────▼───────────────────────────────┐
│ [5] JwtStrategy.validate() 실행                  │
│                                                 │
│     async validate(payload: JwtPayload) {       │
│       const user = await this.userRepository    │
│         .findOne({ where: { id: payload.sub }});│
│                                                 │
│       if (!user) {                              │
│         throw new UnauthorizedException();      │
│       }                                         │
│                                                 │
│       return user;  // User 객체 반환             │
│     }                                           │
└─────────────────┬───────────────────────────────┘
    ↓
┌─────────────────▼───────────────────────────────┐
│ [6] Passport가 결과 처리                           │
│                                                 │
│     request.user = user;  // ← 여기 저장!         │
│     return { success: true, user };             │
└─────────────────┬───────────────────────────────┘
    ↓
┌─────────────────▼───────────────────────────────┐
│ [7] AuthGuard.canActivate() 반환                 │
│                                                 │
│     return true;  // 인증 성공                    │
└─────────────────┬───────────────────────────────┘
    ↓
┌─────────────────▼───────────────────────────────┐
│ [8] Controller 메서드 실행                         │
│                                                 │
│     async create(                               │
│       @CurrentUser() user: User  // request.user│
│     ) { ... }                                   │
└─────────────────────────────────────────────────┘
```