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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { PostsService } from "./posts.service";
import { PostCreateRequestDto } from "./dto/post-create-request.dto";
import { PostUpdateRequestDto } from "./dto/post-update-request.dto";
import { PostResponseDto } from "./dto/post-response.dto";
import { PostListResponseDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../users/entities/user.entity";

@ApiTags("Posts")
@Controller("posts")
@UseInterceptors(ClassSerializerInterceptor)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "게시글 작성" })
  @ApiResponse({
    status: 201,
    description: "게시글 작성 성공",
    type: PostResponseDto,
  })
  @ApiResponse({ status: 400, description: "잘못된 요청" })
  @ApiResponse({ status: 401, description: "인증 실패" })
  @ApiResponse({ status: 422, description: "입력 데이터 검증 실패" })
  @ApiResponse({ status: 500, description: "서버 내부 오류" })
  async create(
    @Body() createPostDto: PostCreateRequestDto,
    @CurrentUser() user: User
  ) {
    return await this.postsService.create(createPostDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "게시글 목록 조회" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "게시글 목록 조회 성공",
    type: PostListResponseDto,
  })
  @ApiResponse({ status: 401, description: "인증 실패" })
  @ApiResponse({ status: 500, description: "서버 내부 오류" })
  async findAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("search") search: string | undefined = undefined,
    @CurrentUser() user: User
  ) {
    return await this.postsService.findAll(page, limit, search, user.id);
  }

  @Get(":postId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "게시글 상세 조회" })
  @ApiResponse({
    status: 200,
    description: "게시글 조회 성공",
    type: PostResponseDto,
  })
  @ApiResponse({ status: 401, description: "인증 실패" })
  @ApiResponse({ status: 404, description: "게시글을 찾을 수 없음" })
  @ApiResponse({ status: 500, description: "서버 내부 오류" })
  async findOne(
    @Param("postId", ParseIntPipe) id: number,
    @CurrentUser() user: User
  ) {
    return await this.postsService.findOne(id, user.id);
  }

  @Patch(":postId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "게시글 수정" })
  @ApiResponse({
    status: 200,
    description: "게시글 수정 성공",
    type: PostResponseDto,
  })
  @ApiResponse({ status: 400, description: "잘못된 요청" })
  @ApiResponse({ status: 401, description: "인증 실패" })
  @ApiResponse({ status: 403, description: "권한 없음" })
  @ApiResponse({ status: 404, description: "게시글을 찾을 수 없음" })
  @ApiResponse({ status: 422, description: "입력 데이터 검증 실패" })
  @ApiResponse({ status: 500, description: "서버 내부 오류" })
  async update(
    @Param("postId", ParseIntPipe) id: number,
    @Body() updatePostDto: PostUpdateRequestDto,
    @CurrentUser() user: User
  ) {
    return await this.postsService.update(id, updatePostDto, user);
  }

  @Delete(":postId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiOperation({ summary: "게시글 삭제" })
  @ApiResponse({ status: 204, description: "게시글 삭제 성공" })
  @ApiResponse({ status: 401, description: "인증 실패" })
  @ApiResponse({ status: 403, description: "권한 없음" })
  @ApiResponse({ status: 404, description: "게시글을 찾을 수 없음" })
  @ApiResponse({ status: 500, description: "서버 내부 오류" })
  async remove(
    @Param("postId", ParseIntPipe) id: number,
    @CurrentUser() user: User
  ) {
    await this.postsService.remove(id, user);
    return;
  }
}
