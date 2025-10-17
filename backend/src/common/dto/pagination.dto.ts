import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 100, description: '전체 항목 수' })
  total: number;

  @ApiProperty({ example: 1, description: '현재 페이지 (1부터 시작)' })
  page: number;

  @ApiProperty({ example: 10, description: '페이지당 항목 수' })
  limit: number;

  @ApiProperty({ example: 10, description: '전체 페이지 수' })
  totalPages: number;
}

export class PostListResponseDto {
  @ApiProperty({ type: () => Array })
  data: any[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class CommentListResponseDto {
  @ApiProperty({ type: () => Array })
  data: any[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
