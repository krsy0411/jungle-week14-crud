import { ApiProperty } from "@nestjs/swagger";
import { UserResponseDto } from "../../users/dto/user-response.dto";

export class CommentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "댓글 내용입니다." })
  content: string;

  @ApiProperty({ example: 1 })
  postId: number;

  @ApiProperty({ example: 1 })
  authorId: number;

  @ApiProperty({ type: UserResponseDto })
  author: UserResponseDto;

  @ApiProperty({ example: "2024-01-01T00:00:00Z" })
  createdAt: Date;

  @ApiProperty({ example: "2024-01-01T00:00:00Z" })
  updatedAt: Date;
}
