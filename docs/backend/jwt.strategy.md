# jwt.strategy.ts

### 목적
#### passport
Node.js용 인증 미들웨어로, 다양한 인증 전략(로컬, JWT, OAuth, OAuth2, API 키 등)을 플러그인 형태로 쉽게 이용하도록 하기 위해 사용합니다.

> 🥕 인증 로직을 전략(strategy) 단위로 분리합니다.

#### jwt strategy
Passport의 JWT 전략을 NestJS에서 구현한 것입니다.

### validate 메서드
Passport의 `JWTStrategy`는 토큰이 서명되고 만료 체크를 통과하면 이 `validate` 메서드를 호출합니다.

동작은 다음과 같습니다 : 
- `payload.sub`를 이용해 DB(User 레포지토리)에서 사용자 조회: `this.userRepository.findOne({ where: { id: payload.sub } })`
- 사용자가 없으면 `UnauthorizedException`을 던져 401 응답을 만들고 인증 실패 처리를 합니다.
- 사용자가 있으면 해당 User 엔티티를 반환합니다. 반환값은 이후 request.user로 설정되어 컨트롤러/핸들러에서 사용 가능합니다.

### 동작 흐름
1. 클라이언트가 `Authorization` 헤더를 붙여 요청을 보냅니다.
2. 요청에 연결된 Guard(EX : JwtAuthGuard)가 Passport에 위임합니다.
3. Passport의 JwtStrategy가 토큰을 추출하고 서명/만료를 검증합니다.
4. JWT가 유효하면 `validate(payload)`를 호출합니다.
5. `validate`는 DB에서 사용자 조회를 시도합니다.
6. 사용자가 존재하면 User 객체가 반환되어 `request.user`에 바인딩됩니다.
7. 컨트롤러에서 `@Req()` 또는 `@CurrentUser()`(커스텀 데코레이터)로 인증된 사용자에 접근 가능합니다.
