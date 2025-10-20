import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";
import { Comment } from "./entities/comment.entity";
import { PostsModule } from "../posts/posts.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), PostsModule, AuthModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
