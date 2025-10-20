import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginRequestDto } from "./dto/login-request.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import { UserCreateRequestDto } from "../users/dto/user-create-request.dto";
import { UserResponseDto } from "../users/dto/user-response.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../users/entities/user.entity";

@ApiTags("Auth")
@Controller("auth")
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiSecurity("none")
  @ApiOperation({ summary: "회원가입" })
  @ApiResponse({
    status: 201,
    description: "회원가입 성공",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: "잘못된 요청" })
  @ApiResponse({ status: 409, description: "이미 존재하는 리소스" })
  @ApiResponse({ status: 422, description: "입력 데이터 검증 실패" })
  @ApiResponse({ status: 500, description: "서버 내부 오류" })
  async register(@Body() createUserDto: UserCreateRequestDto) {
    return await this.authService.register(createUserDto);
  }

  @Post("login")
  @ApiSecurity("none")
  @ApiOperation({ summary: "로그인" })
  @ApiResponse({
    status: 200,
    description: "로그인 성공",
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: "인증 실패" })
  @ApiResponse({ status: 422, description: "입력 데이터 검증 실패" })
  @ApiResponse({ status: 500, description: "서버 내부 오류" })
  async login(@Body() loginDto: LoginRequestDto) {
    return await this.authService.login(loginDto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "현재 사용자 정보 조회" })
  @ApiResponse({
    status: 200,
    description: "사용자 정보 조회 성공",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: "인증 실패" })
  @ApiResponse({ status: 500, description: "서버 내부 오류" })
  async getCurrentUser(@CurrentUser() user: User) {
    return user;
  }
}
