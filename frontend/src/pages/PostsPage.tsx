import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Alert,
  Modal,
  Like,
  SortButton,
  SearchBox,
  InfiniteScroll,
  LoadingIcon,
} from "../components/common";
import { apiService } from "../services/api";
import { Post } from "../types";

const POSTS_PER_PAGE = 5; // 한 번에 로드할 포스트 개수
const THRESHOLD = 1.0; // 무한 스크롤 임계값(대상 요소의 몇 %가 뷰포트에 들어왔을 때 콜백을 트리거할지 결정하는 값)

export const PostsPage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [likingPostId, setLikingPostId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // sortBy 변경시 초기화 후 첫 페이지 로드
  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        setIsLoading(true);
        setPosts([]);
        setPage(1);
        setHasMore(true);

        const response = await apiService.getPosts(1, POSTS_PER_PAGE, sortBy);
        setPosts(response.data);

        // 더 이상 데이터가 없는지 확인
        setHasMore(response.data.length === POSTS_PER_PAGE);
      } catch (err: any) {
        setError(err.response?.data?.message || "게시글을 불러오지 못했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialPosts();
  }, [sortBy]);

  // 추가 포스트 로드
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);

      // 시각적 효과를 위한 1.5초 딜레이
      await new Promise(resolve => setTimeout(resolve, 1500));

      const nextPage = page + 1;
      const response = await apiService.getPosts(nextPage, POSTS_PER_PAGE, sortBy);

      if (response.data.length > 0) {
        setPosts((prev) => [...prev, ...response.data]);
        setPage(nextPage);
        setHasMore(response.data.length === POSTS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "추가 게시글을 불러오지 못했습니다");
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, sortBy, hasMore, isLoadingMore]);

  // 클라이언트 측 필터링 (title에 search 포함 여부)
  const filteredPosts = React.useMemo(() => {
    if (!search) return posts;
    const q = search.trim().toLowerCase();
    return posts.filter((p) => p.title.toLowerCase().includes(q));
  }, [posts, search]);

  const openDeleteModal = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      await apiService.deletePost(deleteTargetId);
      setPosts(posts.filter((post) => post.id !== deleteTargetId));
      setSuccess("게시글이 삭제되었습니다");
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "게시글 삭제에 실패했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleLike = async (postId: number, currentIsLiked: boolean) => {
    setLikingPostId(postId);
    try {
      const response = await apiService.toggleLike(postId, currentIsLiked);
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: response.liked,
                likeCount: response.likeCount,
              }
            : post
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "좋아요 처리에 실패했습니다");
    } finally {
      setLikingPostId(null);
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
        <Button variant="primary" onClick={() => navigate("/posts/create")}>
          새 게시글 작성
        </Button>

        <SortButton sortBy={sortBy} onChange={setSortBy} />
      </div>

      <div className="w-full">
        <SearchBox onSearch={setSearch} />
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-secondary-600 mb-4">게시글이 없습니다</p>
          <Button variant="primary" onClick={() => navigate("/posts/create")}>
            첫 게시글 작성하기
          </Button>
        </div>
      ) : (
        <InfiniteScroll
          onLoadMore={loadMorePosts}
          hasMore={hasMore}
          isLoading={isLoadingMore}
          loader={
            <div className="flex items-center justify-center gap-2 text-secondary-600">
              <LoadingIcon size="md" />
              <span>추가 게시글 로딩중...</span>
            </div>
          }
          endMessage={<p className="text-secondary-500 text-sm">🎊 모든 게시글을 불러왔습니다 🎊</p>}
          threshold={THRESHOLD}
        >
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                hoverable
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-secondary-900 mb-2">
                        {post.title}
                      </h2>
                      <p className="text-secondary-600 line-clamp-2">
                        {post.content}
                      </p>
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
                          openDeleteModal(post.id);
                        }}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                </CardBody>
                <CardFooter>
                  <div className="flex items-center gap-4 text-sm text-secondary-500">
                    <span>{post.author.username}</span>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <span>💬 {post.commentCount || 0}</span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Like
                        isLiked={post.isLiked || false}
                        likeCount={post.likeCount || 0}
                        onToggle={() =>
                          handleToggleLike(post.id, post.isLiked || false)
                        }
                        isLoading={likingPostId === post.id}
                        size="sm"
                      />
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </InfiniteScroll>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        title="게시글 삭제"
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
        onConfirm={handleDelete}
        confirmText="삭제"
        cancelText="취소"
        isLoading={isDeleting}
      >
        <p className="text-secondary-700">정말 이 게시글을 삭제하시겠습니까?</p>
        <p className="text-sm text-secondary-500 mt-2">
          삭제된 게시글은 복구할 수 없습니다.
        </p>
      </Modal>
    </div>
  );
};
