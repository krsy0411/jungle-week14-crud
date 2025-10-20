# current-user.decorator.ts

#### 🎯 목적
JWT 인증 후, 현재 로그인한 사용자 정보를 컨트롤러 메서드에서 쉽게 가져오기 위한 커스텀 파라미터 데코레이터

#### 🔎 동작 원리
```markdown
1. 클라이언트가 JWT 토큰과 함께 요청
   ↓
2. JwtAuthGuard가 토큰 검증
   ↓
3. JwtStrategy.validate()가 실행되어 user 객체를 request.user에 저장
   ↓
4. @CurrentUser() 데코레이터가 request.user를 추출
   ↓
5. 컨트롤러 메서드에 User 객체 전달
```

#### 🤷🏻‍♂️ 사용 예시
**데코레이터 없이**
```js
@Post()
@UseGuards(JwtAuthGuard)
async createPost(@Body() dto: PostCreateDto, @Req() request: Request) {
  const user = request.user;  // 매번 request에서 꺼내야 함
  return this.postsService.create(dto, user);
}
```
**데코레이터 사용**
```js
@Post()
@UseGuards(JwtAuthGuard)
async createPost(
  @Body() dto: PostCreateDto,
  @CurrentUser() user: User,  // 간편하고 명확
) {
  return this.postsService.create(dto, user);
}
```