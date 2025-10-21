import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { PostsModule } from "./modules/posts/posts.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { LikesModule } from "./modules/likes/likes.module";
import { RedisModule } from "./modules/redis/redis.module";

@Module({
  /* imports : 다른 모듈을 가져옴 */
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DB_HOST", "localhost"),
        port: configService.get<number>("DB_PORT", 5432),
        username: configService.get<string>("DB_USERNAME", "postgres"),
        password: configService.get<string>("DB_PASSWORD", "postgres"),
        database: configService.get<string>("DB_DATABASE", "board_db"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: configService.get<string>("NODE_ENV") !== "production",
        logging: configService.get<string>("NODE_ENV") === "development",
      }),
    }),
    RedisModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    LikesModule,
  ],
  /* controllers : HTTP 요청을 처리하는 컨트롤러 */
  controllers: [],
  /* providers : 비즈니스 로직을 담당하는 서비스 */
  providers: [],
  /* exports : 다른 모듈에서 사용할 수 있도록 내보냄 */
})
export class AppModule {}
