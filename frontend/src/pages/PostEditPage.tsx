import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Alert,
} from "../components/common";
import { apiService } from "../services/api";
import { Post, UpdatePostRequest } from "../types";

export const PostEditPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      try {
        const data = await apiService.getPost(Number(postId));
        setPost(data);
        setTitle(data.title);
        setContent(data.content);
      } catch (err: any) {
        setError(err.response?.data?.message || "게시글을 불러오지 못했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId) return;
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const payload: UpdatePostRequest = {
      title: title.trim(),
      content: content.trim(),
    };

    try {
      const updated = await apiService.updatePost(Number(postId), payload);
      navigate(`/posts/${updated.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "게시글 수정에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-secondary-600">로딩중...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600">게시글을 찾을 수 없습니다</p>
        <Button variant="primary" onClick={() => navigate("/posts")}>
          목록으로
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">게시글 수정</h1>
        </CardHeader>
        <CardBody>
          {error && (
            <Alert type="error" message={error} onClose={() => setError("")} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="게시글 제목을 입력하세요"
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={10}
                placeholder="게시글 내용을 입력하세요"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                취소
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                저장
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default PostEditPage;
