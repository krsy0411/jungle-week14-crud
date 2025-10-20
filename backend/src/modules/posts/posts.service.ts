import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { Post } from "./entities/post.entity";
import { PostCreateRequestDto } from "./dto/post-create-request.dto";
import { PostUpdateRequestDto } from "./dto/post-update-request.dto";
import { User } from "../users/entities/user.entity";
import { LikesService } from "../likes/likes.service";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private likesService: LikesService
  ) {}
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

    return await this.postRepository.save(post);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    userId?: number
  ): Promise<any> {
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

    const commentCounts = await this.postRepository
      .createQueryBuilder("post")
      .leftJoin("post.comments", "comment")
      .where("post.id IN (:...postIds)", { postIds })
      .select("post.id", "postId")
      .addSelect("COUNT(comment.id)", "commentCount")
      .groupBy("post.id")
      .getRawMany();

    // likeCounts 추가(한 번의 쿼리로 모든 좋아요 개수 조회)
    const likeCounts = await this.postRepository
      .createQueryBuilder("post")
      .leftJoin("post.likes", "like")
      .where("post.id IN (:...postIds)", { postIds })
      .select("post.id", "postId")
      .addSelect("COUNT(like.id)", "likeCount")
      .groupBy("post.id")
      .getRawMany();

    // Map으로 변환하여 빠른 조회
    const commentCountMap = new Map(
      commentCounts.map((item) => [item.postId, parseInt(item.commentCount)])
    );

    const likeCountMap = new Map(
      likeCounts.map((item) => [item.postId, parseInt(item.likeCount)])
    );

    // userId가 있는 경우 isLiked 정보 조회
    const isLikedMap = new Map<number, boolean>();
    if (userId && postIds.length > 0) {
      for (const postId of postIds) {
        const isLiked = await this.likesService.isLikedByUser(postId, userId);
        isLikedMap.set(postId, isLiked);
      }
    }

    // 데이터에 댓글 개수, 좋아요 개수, isLiked 추가
    const dataWithCounts = data.map((post) => ({
      ...post,
      commentCount: (commentCountMap.get(post.id) || 0),
      likeCount: (likeCountMap.get(post.id) || 0),
      isLiked: userId ? (isLikedMap.get(post.id) || false) : undefined,
    }));

    return {
      data: dataWithCounts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, userId?: number): Promise<Post> {
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

    // userId가 있는 경우 isLiked 정보 추가
    const result: any = { ...post };
    if (userId) {
      result.isLiked = await this.likesService.isLikedByUser(id, userId);
    }

    return result;
  }

  async update(
    id: number,
    updatePostDto: PostUpdateRequestDto,
    user: User
  ): Promise<Post> {
    const post = await this.findOne(id);

    if (post.authorId !== user.id) {
      throw new ForbiddenException("게시글을 수정할 권한이 없습니다");
    }

    this.postRepository.merge(post, updatePostDto);
    return await this.postRepository.save(post);
  }

  async remove(id: number, user: User): Promise<void> {
    const post = await this.findOne(id);

    if (post.authorId !== user.id) {
      throw new ForbiddenException("게시글을 삭제할 권한이 없습니다");
    }

    await this.postRepository.remove(post);
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
