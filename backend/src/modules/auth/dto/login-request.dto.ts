import { IsEmail, IsString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginRequestDto {
  @ApiProperty({
    example: "user@example.com",
    description: "이메일 주소",
  })
  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  email: string;

  @ApiProperty({
    example: "SecurePass123!",
    description: "비밀번호",
  })
  @IsString()
  password: string;
}
