import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserCreateRequestDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '이메일 주소',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  })
  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  email: string;

  @ApiProperty({
    example: 'johndoe',
    description: '사용자명 (알파벳, 숫자, 언더스코어, 하이픈만 허용)',
    minLength: 3,
    maxLength: 20,
    pattern: '^[a-zA-Z0-9_-]+$',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_-]+$/)
  username: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: '비밀번호 (최소 8자, 대소문자, 숫자, 특수문자 각 1개 이상 포함)',
    minLength: 8,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
  password: string;
}
