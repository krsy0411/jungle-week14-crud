import { IsString, MinLength, MaxLength, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PostUpdateRequestDto {
  @ApiProperty({
    example: "수정된 게시글 제목",
    description: "게시글 제목",
    minLength: 1,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  title?: string;

  @ApiProperty({
    example: "수정된 게시글 내용입니다.",
    description: "게시글 내용",
    minLength: 1,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;
}
