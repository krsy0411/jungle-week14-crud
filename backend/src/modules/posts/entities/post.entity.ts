import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  title: string;

  @Column('text')
  content: string;

  @Column({ name: 'author_id' })
  authorId: number;

  /* <eager 옵션> 
   * Post를 조회할때 author(User)를 자동으로 함께 조회해 즉시 로드 => 즉, find()만 호출해도 User 데이터가 포함됨 
   * 장점 : 별도 join 없이도 관계된 데이터를 조회 가능
   * 단점 : 모든 조회에서 항상 조인 비용 발생 -> 성능 저하 우려 
   */
  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
