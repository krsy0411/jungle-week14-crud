import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostCreateRequestDto {
  @ApiProperty({
    example: '새 게시글 제목',
    description: '게시글 제목',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  title: string;

  @ApiProperty({
    example: '게시글 내용을 작성합니다.',
    description: '게시글 내용',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  content: string;
}
