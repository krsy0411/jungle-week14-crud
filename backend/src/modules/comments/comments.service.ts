import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { CommentCreateRequestDto } from "./dto/comment-create-request.dto";
import { CommentUpdateRequestDto } from "./dto/comment-update-request.dto";
import { User } from "../users/entities/user.entity";
import { PostsService } from "../posts/posts.service";
import { CacheService } from "../cache/cache.service";

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private postsService: PostsService,
    private cacheService: CacheService
  ) {}

  private async invalidatePostListCache(action: string): Promise<void> {
    await this.cacheService.invalidatePostListCache(action);
  }

  async create(
    postId: number,
    createCommentDto: CommentCreateRequestDto,
    user: User
  ): Promise<Comment> {
    // 게시글 존재 여부 확인
    await this.postsService.exists(postId);

    const comment = this.commentRepository.create({
      ...createCommentDto,
      postId,
      authorId: user.id,
    });

    const savedComment = await this.commentRepository.save(comment);

    // 게시글 목록 캐시 무효화 (commentCount가 변경되었으므로)
    await this.invalidatePostListCache("comment create");

    return savedComment;
  }

  async findByPost(
    postId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    // 게시글 존재 여부 확인
    await this.postsService.exists(postId);

    const skip = (page - 1) * limit;

    const [data, total] = await this.commentRepository.findAndCount({
      where: { postId },
      skip,
      take: limit,
      order: { createdAt: "ASC" },
      relations: ["author"],
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ["author"],
    });

    if (!comment) {
      throw new NotFoundException("댓글을 찾을 수 없습니다");
    }

    return comment;
  }

  async update(
    id: number,
    updateCommentDto: CommentUpdateRequestDto,
    user: User
  ): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundException("댓글을 찾을 수 없습니다");
    }

    if (comment.authorId !== user.id) {
      throw new ForbiddenException("댓글을 수정할 권한이 없습니다");
    }

    this.commentRepository.merge(comment, updateCommentDto);
    return await this.commentRepository.save(comment);
  }

  async remove(id: number, user: User): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundException("댓글을 찾을 수 없습니다");
    }

    if (comment.authorId !== user.id) {
      throw new ForbiddenException("댓글을 삭제할 권한이 없습니다");
    }

    await this.commentRepository.remove(comment);

    // 게시글 목록 캐시 무효화 (commentCount가 변경되었으므로)
    await this.invalidatePostListCache("comment delete");
  }
}
