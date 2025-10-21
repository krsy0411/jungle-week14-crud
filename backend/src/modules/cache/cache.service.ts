import { Injectable, Logger } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

/**
 * 캐시 관리를 담당하는 독립적인 서비스
 *
 * 순환 의존성 방지:
 * - PostsService, LikesService, CommentsService 모두 이 서비스에 의존
 * - 이 서비스는 RedisService에만 의존
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private redisService: RedisService) {}

  /**
   * 게시글 목록 캐시를 무효화합니다.
   * @param action 캐시 무효화 이유 (로깅용)
   */
  async invalidatePostListCache(action: string): Promise<void> {
    await this.redisService.delByPattern("posts:page:*");
    this.logger.log(`[CACHE INVALIDATED] posts:page:* (${action})`);
  }
}
