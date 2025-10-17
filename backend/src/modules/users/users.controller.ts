import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';
import { PostListResponseDto } from '../../common/dto/pagination.dto';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get(':userId')
  @ApiSecurity('none')
  @ApiOperation({ summary: '사용자 정보 조회' })
  @ApiResponse({ status: 200, description: '사용자 정보 조회 성공', type: UserResponseDto })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getUser(@Param('userId', ParseIntPipe) userId: number) {
    return await this.usersService.findOne(userId);
  }

  @Get(':userId/posts')
  @ApiSecurity('none')
  @ApiOperation({ summary: '사용자가 작성한 게시글 목록' })
  @ApiResponse({ status: 200, description: '게시글 목록 조회 성공', type: PostListResponseDto })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getUserPosts(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.usersService.getUserPosts(userId, page, limit);
  }
}
