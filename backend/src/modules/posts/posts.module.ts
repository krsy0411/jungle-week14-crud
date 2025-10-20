import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";
import { Post } from "./entities/post.entity";
import { AuthModule } from "../auth/auth.module";
import { LikesModule } from "../likes/likes.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]), // Post 엔티티를 사용하기 위해 등록
    AuthModule,
    LikesModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
