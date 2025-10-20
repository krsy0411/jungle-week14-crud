import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Post } from "../../posts/entities/post.entity";

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 500 })
  content: string;

  @Column({ name: "post_id" })
  postId: number;

  @ManyToOne(() => Post, (post) => post.comments, { eager: false })
  @JoinColumn({ name: "post_id" })
  post: Post;

  @Column({ name: "author_id" })
  authorId: number;

  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  @JoinColumn({ name: "author_id" })
  author: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
