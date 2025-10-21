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

  // Redis에 저장할 캐시 통계 키
  private readonly CACHE_HITS_KEY = "metrics:cache:hits";
  private readonly CACHE_MISSES_KEY = "metrics:cache:misses";

  constructor(private redisService: RedisService) {}

  /**
   * 게시글 목록 캐시를 무효화합니다.
   * @param action 캐시 무효화 이유 (로깅용)
   */
  async invalidatePostListCache(action: string): Promise<void> {
    await this.redisService.delByPattern("posts:page:*");
    this.logger.log(`[CACHE INVALIDATED] posts:page:* (${action})`);
  }

  /**
   * Redis에서 캐시 히트 카운트를 증가시킵니다.
   * INCR 명령어는 원자적(atomic) 연산이므로 race condition 걱정 없음
   */
  async incrementHits(): Promise<void> {
    await this.redisService.getClient().incr(this.CACHE_HITS_KEY);
  }

  /**
   * Redis에서 캐시 미스 카운트를 증가시킵니다.
   * INCR 명령어는 원자적(atomic) 연산이므로 race condition 걱정 없음
   */
  async incrementMisses(): Promise<void> {
    await this.redisService.getClient().incr(this.CACHE_MISSES_KEY);
  }

  /**
   * Redis에서 캐시 히트율을 계산합니다.
   * 모든 서버 인스턴스의 통계를 합산하여 정확한 전체 히트율 제공
   * @returns 히트율 (퍼센트, 소수점 둘째자리)
   */
  async getHitRate(): Promise<string> {
    const hits = await this.redisService.getClient().get(this.CACHE_HITS_KEY);
    const misses = await this.redisService
      .getClient()
      .get(this.CACHE_MISSES_KEY);

    const cacheHits = parseInt(hits || "0");
    const cacheMisses = parseInt(misses || "0");
    const total = cacheHits + cacheMisses;

    if (total === 0) return "0.00";
    return ((cacheHits / total) * 100).toFixed(2);
  }
}
