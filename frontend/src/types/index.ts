// User 타입
export interface User {
  id: number;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

// Post 타입
export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  author: User;
  commentCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Comment 타입
export interface Comment {
  id: number;
  content: string;
  postId: number;
  authorId: number;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}

// 요청 DTO
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// 응답 타입
export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
