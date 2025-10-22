import React, { useEffect, useRef } from "react";

interface InfiniteScrollProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
  threshold?: number;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  loader = <p className="text-secondary-600">로딩중...</p>,
  endMessage = (
    <p className="text-secondary-500 text-sm">모든 항목을 불러왔습니다</p>
  ),
  threshold = 1.0,
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 첫 번째 엔트리가 관찰 대상과 교차하고, 더 불러올 항목이 있으며, 현재 로딩 중이 아닐 때 : 추가 항목 불러오기
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget); // currentTarget 요소 관찰 시작(observer의 entry로 전달됨)
    }

    /* Cleanup 함수 반환 */
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
      observer.disconnect();
    };
  }, [hasMore, isLoading, onLoadMore, threshold]);

  return (
    <>
      {children}

      <div ref={observerTarget} className="py-8 text-center">
        {isLoading && loader}
        {!hasMore && !isLoading && endMessage}
      </div>
    </>
  );
};
