import axios, { AxiosInstance } from "axios";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  Post,
  Comment,
  User,
  PaginatedResponse,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 요청 인터셉터: Authorization 헤더 추가
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // 응답 인터셉터: 401 에러 처리
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // ========== Auth ==========
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post("/auth/login", data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<User> {
    const response = await this.client.post("/auth/register", data);
    return response.data;
  }

  // ========== Posts ==========
  async getPosts(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Post>> {
    const response = await this.client.get("/posts", {
      params: { page, limit },
    });
    return response.data;
  }

  async getPost(id: number): Promise<Post> {
    const response = await this.client.get(`/posts/${id}`);
    return response.data;
  }

  async createPost(data: CreatePostRequest): Promise<Post> {
    const response = await this.client.post("/posts", data);
    return response.data;
  }

  async updatePost(id: number, data: UpdatePostRequest): Promise<Post> {
    const response = await this.client.patch(`/posts/${id}`, data);
    return response.data;
  }

  async deletePost(id: number): Promise<void> {
    await this.client.delete(`/posts/${id}`);
  }

  // ========== Comments ==========
  async getComments(
    postId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Comment>> {
    const response = await this.client.get(`/posts/${postId}/comments`, {
      params: { page, limit },
    });
    return response.data;
  }

  async createComment(
    postId: number,
    data: CreateCommentRequest
  ): Promise<Comment> {
    const response = await this.client.post(`/posts/${postId}/comments`, data);
    return response.data;
  }

  async updateComment(
    postId: number,
    commentId: number,
    data: UpdateCommentRequest
  ): Promise<Comment> {
    const response = await this.client.patch(
      `/posts/${postId}/comments/${commentId}`,
      data
    );
    return response.data;
  }

  async deleteComment(postId: number, commentId: number): Promise<void> {
    await this.client.delete(`/posts/${postId}/comments/${commentId}`);
  }

  // ========== Likes ==========
  async toggleLike(
    postId: number,
    isCurrentlyLiked: boolean
  ): Promise<{ liked: boolean; likeCount: number }> {
    if (isCurrentlyLiked) {
      const response = await this.client.delete(`/posts/${postId}/like`);
      return response.data;
    } else {
      const response = await this.client.post(`/posts/${postId}/like`);
      return response.data;
    }
  }
}

export const apiService = new ApiService();
