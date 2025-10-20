import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Like } from "./entities/like.entity";
import { Post } from "../posts/entities/post.entity";
import { User } from "../users/entities/user.entity";
import { LikeResponseDto } from "./dto/like-response.dto";

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>
  ) {}

  async toggleLike(postId: number, user: User): Promise<LikeResponseDto> {
    // 게시글 존재 확인
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException("게시글을 찾을 수 없습니다");
    }

    // 기존 좋아요 확인
    const existingLike = await this.likeRepository.findOne({
      where: { postId, userId: user.id },
    });

    let liked: boolean;

    if (existingLike) {
      // 좋아요가 이미 있으면 제거
      await this.likeRepository.remove(existingLike);
      liked = false;
    } else {
      // 좋아요가 없으면 추가
      const newLike = this.likeRepository.create({
        postId,
        userId: user.id,
      });
      await this.likeRepository.save(newLike);
      liked = true;
    }

    // 현재 좋아요 수 조회
    const likeCount = await this.likeRepository.count({ where: { postId } });

    return {
      liked,
      likeCount,
    };
  }

  async addLike(postId: number, user: User): Promise<LikeResponseDto> {
    // 게시글 존재 확인
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException("게시글을 찾을 수 없습니다");
    }

    // 기존 좋아요 확인
    const existingLike = await this.likeRepository.findOne({
      where: { postId, userId: user.id },
    });

    // 좋아요가 없으면 추가
    if (!existingLike) {
      const newLike = this.likeRepository.create({
        postId,
        userId: user.id,
      });
      await this.likeRepository.save(newLike);
    }

    // 현재 좋아요 수 조회
    const likeCount = await this.likeRepository.count({ where: { postId } });

    return {
      liked: true,
      likeCount,
    };
  }

  async removeLike(postId: number, user: User): Promise<LikeResponseDto> {
    // 게시글 존재 확인
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException("게시글을 찾을 수 없습니다");
    }

    // 기존 좋아요 확인
    const existingLike = await this.likeRepository.findOne({
      where: { postId, userId: user.id },
    });

    // 좋아요가 있으면 제거
    if (existingLike) {
      await this.likeRepository.remove(existingLike);
    }

    // 현재 좋아요 수 조회
    const likeCount = await this.likeRepository.count({ where: { postId } });

    return {
      liked: false,
      likeCount,
    };
  }

  async getLikeCount(postId: number): Promise<number> {
    return await this.likeRepository.count({ where: { postId } });
  }

  async isLikedByUser(postId: number, userId: number): Promise<boolean> {
    const like = await this.likeRepository.findOne({
      where: { postId, userId },
    });
    return !!like;
  }
}
