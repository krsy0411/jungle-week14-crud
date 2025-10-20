import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Alert,
} from "../components/common";
import { apiService } from "../services/api";
import { CreatePostRequest } from "../types";

export const PostCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const payload: CreatePostRequest = {
      title: title.trim(),
      content: content.trim(),
    };

    try {
      const created = await apiService.createPost(payload);
      navigate(`/posts/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "게시글 생성에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">새 게시글 작성</h1>
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
              <Button variant="secondary" onClick={() => navigate("/posts")}>
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

export default PostCreatePage;
