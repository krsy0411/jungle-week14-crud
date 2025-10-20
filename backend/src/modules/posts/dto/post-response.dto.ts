import { ApiProperty } from "@nestjs/swagger";
import { UserResponseDto } from "../../users/dto/user-response.dto";

export class PostResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "첫 번째 게시글" })
  title: string;

  @ApiProperty({ example: "게시글 내용입니다." })
  content: string;

  @ApiProperty({ example: 1 })
  authorId: number;

  @ApiProperty({ type: UserResponseDto })
  author: UserResponseDto;

  @ApiProperty({ example: 5, description: "댓글 수" })
  commentCount?: number;

  @ApiProperty({ example: 10, description: "좋아요 수" })
  likeCount?: number;

  @ApiProperty({ example: true, description: "현재 사용자의 좋아요 여부" })
  isLiked?: boolean;

  @ApiProperty({ example: "2024-01-01T00:00:00Z" })
  createdAt: Date;

  @ApiProperty({ example: "2024-01-01T00:00:00Z" })
  updatedAt: Date;
}
