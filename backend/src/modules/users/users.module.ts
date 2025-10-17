import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Post } from '../posts/entities/post.entity';

@Module({
  /* TypeOrmModule.forFeature() : 이 모듈에서 사용할 엔티티(User, Post)를 등록하는 메서드 */
  imports: [TypeOrmModule.forFeature([User, Post])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
