import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Post } from "../../posts/entities/post.entity";

@Entity("likes")
@Unique(["postId", "userId"]) // 한 사용자가 같은 게시글에 중복 좋아요 방지
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "post_id" })
  postId: number;

  @Column({ name: "user_id" })
  userId: number;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  post: Post;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
