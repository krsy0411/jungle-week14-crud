import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { LoginRequestDto } from "./dto/login-request.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import { UserCreateRequestDto } from "../users/dto/user-create-request.dto";
import { User } from "../users/entities/user.entity";
import { JwtPayload } from "./strategies/jwt.strategy";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async register(createUserDto: UserCreateRequestDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  async login(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException(
        "이메일 또는 비밀번호가 올바르지 않습니다"
      );
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        "이메일 또는 비밀번호가 올바르지 않습니다"
      );
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    // payload를 비밀키로 서명하고 JWT 토큰 생성
    const accessToken = this.jwtService.sign(payload);

    // password 제외
    const { password, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword as any,
    };
  }
}
