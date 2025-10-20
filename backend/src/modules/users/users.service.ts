import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Post } from "../posts/entities/post.entity";
import { UserCreateRequestDto } from "./dto/user-create-request.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>
  ) {}

  async create(createUserDto: UserCreateRequestDto): Promise<User> {
    // 이메일 중복 체크
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUserByEmail) {
      throw new ConflictException("이미 존재하는 이메일입니다");
    }

    // 사용자명 중복 체크
    const existingUserByUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUserByUsername) {
      throw new ConflictException("이미 존재하는 사용자명입니다");
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("사용자를 찾을 수 없습니다");
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async getUserPosts(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    // 사용자 존재 여부 확인
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("사용자를 찾을 수 없습니다");
    }

    const skip = (page - 1) * limit;
    /* findAndCount : 게시글을 조회하고 총 개수를 함께 반환 */
    const [data, total] = await this.postRepository.findAndCount({
      where: { authorId: userId }, // 해당 사용자가 작성한 글만 필터링
      skip, // 건너뛸 개수
      take: limit, // 가져올 개수
      order: { createdAt: "DESC" }, // 최신순 정렬
      relations: ["author"], // 작성자 정보도 함께 조회
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
