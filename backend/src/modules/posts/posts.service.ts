import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { Post } from "./entities/post.entity";
import { PostCreateRequestDto } from "./dto/post-create-request.dto";
import { PostUpdateRequestDto } from "./dto/post-update-request.dto";
import { User } from "../users/entities/user.entity";
import { LikesService } from "../likes/likes.service";
import { RedisService } from "../redis/redis.service";
import { CacheService } from "../cache/cache.service";

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);
  private readonly CACHE_TTL_SECONDS = 60;

  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private likesService: LikesService,
    private redisService: RedisService,
    private cacheService: CacheService
  ) {}

  private getCacheKey(
    page: number,
    limit: number,
    search: string | undefined,
    userId: number
  ): string {
    return `posts:page:${page}:limit:${limit}:search:${
      search || "none"
    }:user:${userId}`;
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.postRepository.count({ where: { id } });

    if (count === 0) {
      throw new NotFoundException("게시글을 찾을 수 없습니다");
    }

    return true;
  }

  async create(createPostDto: PostCreateRequestDto, user: User): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      authorId: user.id,
    });

    const savedPost = await this.postRepository.save(post);

    // 게시글 목록 캐시 무효화
    await this.cacheService.invalidatePostListCache("post create");

    return savedPost;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search: string | undefined = undefined,
    userId: number
  ): Promise<any> {
    // 캐시 키 생성
    const cacheKey = this.getCacheKey(page, limit, search, userId);

    // 캐시 확인
    const cached = await this.redisService.get<any>(cacheKey);
    if (cached) {
      await this.cacheService.incrementHits();
      const hitRate = await this.cacheService.getHitRate();
      this.logger.log(`[CACHE HIT] ${cacheKey} | Hit Rate: ${hitRate}%`);
      return cached;
    }

    await this.cacheService.incrementMisses();
    const hitRate = await this.cacheService.getHitRate();
    this.logger.log(`[CACHE MISS] ${cacheKey} | Hit Rate: ${hitRate}%`);

    const skip = (page - 1) * limit;

    const where = search ? { title: Like(`%${search}%`) } : {};

    const [data, total] = await this.postRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: "DESC" },
      relations: ["author"],
    });

    // commentCount 추가(한 번의 쿼리로 모든 댓글 개수 조회)
    const postIds = data.map((post) => post.id);

    // postIds가 비어있으면 빈 배열 반환
    let commentCounts = [];
    let likeCounts = [];

    if (postIds.length > 0) {
      commentCounts = await this.postRepository
        .createQueryBuilder("post")
        .leftJoin("post.comments", "comment")
        .where("post.id IN (:...postIds)", { postIds })
        .select("post.id", "postId")
        .addSelect("COUNT(comment.id)", "commentCount")
        .groupBy("post.id")
        .getRawMany();

      // likeCounts 추가(한 번의 쿼리로 모든 좋아요 개수 조회)
      likeCounts = await this.postRepository
        .createQueryBuilder("post")
        .leftJoin("post.likes", "like")
        .where("post.id IN (:...postIds)", { postIds })
        .select("post.id", "postId")
        .addSelect("COUNT(like.id)", "likeCount")
        .groupBy("post.id")
        .getRawMany();
    }

    // Map으로 변환하여 빠른 조회
    const commentCountMap = new Map(
      commentCounts.map((item) => [item.postId, parseInt(item.commentCount)])
    );

    const likeCountMap = new Map(
      likeCounts.map((item) => [item.postId, parseInt(item.likeCount)])
    );

    // isLiked 정보 조회 (배치로 한 번에 조회하여 N+1 문제 방지)
    const isLikedMap = new Map<number, boolean>();
    if (postIds.length > 0) {
      const likedPostIds = await this.likesService.getLikedPostIdsByUser(
        postIds,
        userId
      );
      for (const id of likedPostIds) {
        isLikedMap.set(id, true);
      }
    }

    // 데이터에 댓글 개수, 좋아요 개수, isLiked 추가
    const dataWithCounts = data.map((post) => ({
      ...post,
      commentCount: commentCountMap.get(post.id) || 0,
      likeCount: likeCountMap.get(post.id) || 0,
      isLiked: isLikedMap.get(post.id) || false,
    }));

    const result = {
      data: dataWithCounts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // 캐시 저장 (1분 TTL)
    await this.redisService.set(cacheKey, result, this.CACHE_TTL_SECONDS);

    return result;
  }

  async findOne(id: number, userId: number): Promise<Post> {
    // 1번의 쿼리로 게시글, 작성자, 댓글 개수, 좋아요 개수 모두 조회
    const post = await this.postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .loadRelationCountAndMap("post.commentCount", "post.comments")
      .loadRelationCountAndMap("post.likeCount", "post.likes")
      .where("post.id = :id", { id })
      .getOne();

    if (!post) {
      throw new NotFoundException("게시글을 찾을 수 없습니다");
    }

    // isLiked 정보 추가
    const result: any = { ...post };
    result.isLiked = await this.likesService.isLikedByUser(id, userId);

    return result;
  }

  async update(
    id: number,
    updatePostDto: PostUpdateRequestDto,
    user: User
  ): Promise<Post> {
    const post = await this.findOne(id, user.id);

    if (post.authorId !== user.id) {
      throw new ForbiddenException("게시글을 수정할 권한이 없습니다");
    }

    this.postRepository.merge(post, updatePostDto);
    const updatedPost = await this.postRepository.save(post);

    // 게시글 목록 캐시 무효화
    await this.cacheService.invalidatePostListCache("post update");

    return updatedPost;
  }

  async remove(id: number, user: User): Promise<void> {
    const post = await this.findOne(id, user.id);

    if (post.authorId !== user.id) {
      throw new ForbiddenException("게시글을 삭제할 권한이 없습니다");
    }

    await this.postRepository.remove(post);

    // 게시글 목록 캐시 무효화
    await this.cacheService.invalidatePostListCache("post delete");
  }

  async findByAuthor(
    authorId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.postRepository.findAndCount({
      where: { authorId },
      skip,
      take: limit,
      order: { createdAt: "DESC" },
      relations: ["author"], // 작성자 정보도 함께 조회
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
}
