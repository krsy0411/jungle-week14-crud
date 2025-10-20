import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiQuery,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CommentCreateRequestDto } from './dto/comment-create-request.dto';
import { CommentUpdateRequestDto } from './dto/comment-update-request.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CommentListResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Comments')
@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('posts/:postId/comments')
  @ApiSecurity('none')
  @ApiOperation({ summary: '댓글 목록 조회' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '댓글 목록 조회 성공', type: CommentListResponseDto })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async findByPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.commentsService.findByPost(postId, page, limit);
  }

  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 작성' })
  @ApiResponse({ status: 201, description: '댓글 작성 성공', type: CommentResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  @ApiResponse({ status: 422, description: '입력 데이터 검증 실패' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async create(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CommentCreateRequestDto,
    @CurrentUser() user: User,
  ) {
    return await this.commentsService.create(postId, createCommentDto, user);
  }

  @Patch('posts/:postId/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 수정' })
  @ApiResponse({ status: 200, description: '댓글 수정 성공', type: CommentResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  @ApiResponse({ status: 422, description: '입력 데이터 검증 실패' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async update(
    @Param('commentId', ParseIntPipe) id: number,
    @Body() updateCommentDto: CommentUpdateRequestDto,
    @CurrentUser() user: User,
  ) {
    return await this.commentsService.update(id, updateCommentDto, user);
  }

  @Delete('posts/:postId/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiResponse({ status: 204, description: '댓글 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async remove(
    @Param('commentId', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.commentsService.remove(id, user);
    return;
  }
}
