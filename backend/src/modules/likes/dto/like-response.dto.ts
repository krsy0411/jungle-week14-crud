import { ApiProperty } from "@nestjs/swagger";

export class LikeResponseDto {
  @ApiProperty({
    description: "좋아요 상태",
    example: true,
  })
  liked: boolean;

  @ApiProperty({
    description: "현재 게시글의 총 좋아요 수",
    example: 11,
  })
  likeCount: number;
}
