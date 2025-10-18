import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader, CardFooter, Alert } from '../components/common';
import { apiService } from '../services/api';
import { Post } from '../types';

export const PostsPage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiService.getPosts();
        setPosts(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || '게시글을 불러오지 못했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await apiService.deletePost(id);
      setPosts(posts.filter((post) => post.id !== id));
      alert('게시글이 삭제되었습니다');
    } catch (err: any) {
      setError(err.response?.data?.message || '게시글 삭제에 실패했습니다');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-secondary-600">로딩중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-secondary-900">게시글 목록</h1>
        <Button variant="primary" onClick={() => navigate('/posts/create')}>
          새 게시글 작성
        </Button>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-secondary-600 mb-4">게시글이 없습니다</p>
          <Button variant="primary" onClick={() => navigate('/posts/create')}>
            첫 게시글 작성하기
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} hoverable onClick={() => navigate(`/posts/${post.id}`)}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-secondary-900 mb-2">{post.title}</h2>
                    <p className="text-secondary-600 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-secondary-500">
                      <span>{post.author.username}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>💬 {post.commentCount || 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/posts/${post.id}/edit`);
                      }}
                    >
                      수정
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(post.id);
                      }}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
