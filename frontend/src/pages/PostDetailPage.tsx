import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader, Input, Alert } from '../components/common';
import { apiService } from '../services/api';
import { Post, Comment, CreateCommentRequest } from '../types';

export const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        if (!postId) return;
        const postData = await apiService.getPost(Number(postId));
        setPost(postData);

        const commentsData = await apiService.getComments(Number(postId));
        setComments(commentsData.data);
      } catch (err: any) {
        setError(err.response?.data?.message || '게시글을 불러오지 못했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostAndComments();
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !postId) return;

    setIsSubmitting(true);
    try {
      await apiService.createComment(Number(postId), {
        content: commentContent,
      });
      // 댓글 작성 후 댓글 목록을 다시 조회하여 author 정보 포함
      const updatedComments = await apiService.getComments(Number(postId));
      setComments(updatedComments.data);
      setCommentContent('');
      setSuccess('댓글이 작성되었습니다');
    } catch (err: any) {
      setError(err.response?.data?.message || '댓글 작성에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    if (!postId) return;

    try {
      await apiService.deleteComment(Number(postId), commentId);
      setComments(comments.filter((c) => c.id !== commentId));
      setSuccess('댓글이 삭제되었습니다');
    } catch (err: any) {
      setError(err.response?.data?.message || '댓글 삭제에 실패했습니다');
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
        <Button variant="primary" onClick={() => navigate('/posts')} className="mt-4">
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="secondary" size="sm" onClick={() => navigate('/posts')}>
        ← 목록으로
      </Button>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess('')}
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">{post.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-secondary-600">
                <span>{post.author.username}</span>
                <span>{new Date(post.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/posts/${post.id}/edit`)}
              >
                수정
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (confirm('정말 삭제하시겠습니까?')) {
                    apiService.deletePost(post.id).then(() => {
                      setSuccess('게시글이 삭제되었습니다');
                      setTimeout(() => {
                        navigate('/posts');
                      }, 1000);
                    });
                  }
                }}
              >
                삭제
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="prose prose-sm max-w-none">
            <p className="text-secondary-800 whitespace-pre-wrap">{post.content}</p>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-secondary-900">댓글 ({comments.length})</h2>

        <Card>
          <CardBody>
            <form onSubmit={handleAddComment} className="space-y-3">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="댓글을 작성하세요"
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
              >
                댓글 작성
              </Button>
            </form>
          </CardBody>
        </Card>

        {comments.length === 0 ? (
          <p className="text-secondary-600 text-center py-8">댓글이 없습니다</p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardBody>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-secondary-900">{comment.author.username}</p>
                      <p className="text-sm text-secondary-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      삭제
                    </Button>
                  </div>
                  <p className="text-secondary-800">{comment.content}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
