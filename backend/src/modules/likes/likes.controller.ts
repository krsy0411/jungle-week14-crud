import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { LikesService } from "./likes.service";
import { LikeResponseDto } from "./dto/like-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../users/entities/user.entity";

@ApiTags("Likes")
@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post("posts/:postId/like")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "게시글 좋아요 추가" })
  @ApiResponse({
    status: 200,
    description: "좋아요 추가 성공",
    type: LikeResponseDto,
  })
  @ApiResponse({ status: 401, description: "인증 실패" })
  @ApiResponse({ status: 404, description: "게시글을 찾을 수 없음" })
  @ApiResponse({ status: 500, description: "서버 내부 오류" })
  async likePost(
    @Param("postId", ParseIntPipe) postId: number,
    @CurrentUser() user: User
  ): Promise<LikeResponseDto> {
    return await this.likesService.addLike(postId, user);
  }

  @Delete("posts/:postId/like")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "게시글 좋아요 취소" })
  @ApiResponse({
    status: 200,
    description: "좋아요 취소 성공",
    type: LikeResponseDto,
  })
  @ApiResponse({ status: 401, description: "인증 실패" })
  @ApiResponse({ status: 404, description: "게시글을 찾을 수 없음" })
  @ApiResponse({ status: 500, description: "서버 내부 오류" })
  async unlikePost(
    @Param("postId", ParseIntPipe) postId: number,
    @CurrentUser() user: User
  ): Promise<LikeResponseDto> {
    return await this.likesService.removeLike(postId, user);
  }
}
