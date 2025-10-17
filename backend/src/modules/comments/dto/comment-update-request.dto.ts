import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CommentUpdateRequestDto {
  @ApiProperty({
    example: '수정된 댓글 내용입니다.',
    description: '댓글 내용',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content: string;
}
