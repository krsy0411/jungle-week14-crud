# Infinite Scroll
무한 스크롤 : 사용자가 페이지를 스크롤할 때마다 추가 컨텐츠를 자동으로 로드하는 기능

## 장단점

### 장점
- UX가 자연스럽고 모바일에 적합
- 초기 로드 경량화(초기 로드 시 모든 데이터를 불러오지 않음)

### 단점
- 사용자가 전체 컨텐츠 위치로 접근하기 어려움
- 스크롤 위치 유지 및 공유(특정 아이템으로 바로가기)가 복잡
- 긴 리스트에선 메모리 / 렌더링 비용 증가(가상화 필요)
- SEO에 부정적 영향(검색 엔진이 모든 컨텐츠를 인덱싱하지 못할 수 있음)

## 구현 방법
1. **Intersection Observer**
  - 리스트 끝(sentinel 요소)에 가상 엘리먼트 배치
  - IntersectionObserver로 sentinel이 뷰포트에 들어올 때 추가 로딩 호출
2. **Scroll Event**
  - 윈도우 or 스크롤 컨테이너의 'scroll' 이벤트를 수신해 현재 스크롤 위치와 컨테이너 높이를 비교
  - 일정 임계값(threshold) 이하면 더 불러오기 호출

> 🥕 여기서는 1번 방법에 대해 학습 글을 작성했습니다.

## React 예제 (Intersection Observer 사용)
```tsx
function InfiniteScroll({ children, onLoadMore, hasMore, isLoading, root, rootMargin = '0px 0px 200px 0px' }: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isLoading) {
        onLoadMore().catch(() => {/* handle */});
      }
    }, { root, rootMargin });

    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, isLoading, onLoadMore, root, rootMargin]);

  return (
    <div>
      {children}
      <div ref={sentinelRef} />
      {isLoading && <Loading />}
      {!hasMore && <div>끝</div>}
    </div>
  );
}
```

### IntersectionObserver 콜백 함수
가시성의 변화가 생겼을 때 호출되는 콜백 함수. 타겟 요소의 관찰이 시작되거나 가시성에 변화가 감지되면(= `threshold`와 만나면) 등록된 콜백 함수가 실행됨
```ts
let callback = (entries, observer) => {
  entries.forEach(entry => {
    // 각 엔트리 처리 로직 : 가시성 변화를 감지할 때마다 실행됨
    /*
      target element :
        - entry.target
        - entry.isIntersecting (가시성 여부)
        - entry.intersectionRatio (교차 비율)
        - entry.boundingClientRect (타겟의 경계 사각형)
        - entry.intersectionRect (교차 영역의 사각형)
        - entry.rootBounds (루트 요소의 경계 사각형)
        - 등등
    */
  })
}
```

#### entries 매개변수
IntersectionObserver 콜백에 넘겨지는 변경된 관찰 항목들의 배열. 각 항목은 `observer.observe(target)`로 관찰된(등록된) DOM 요소가 뷰포트(또는 지정된 루트 요소)와 교차할 때마다 브라우저가 비동기적으로 전달
1. **등록 시점**
  - 코드에서 `observer.observe(target)`가 호출된 후부터 브라우저는 `currentTarget` 요소를 관찰 대상으로 등록
2. **콜백이 호출되는 시점(entries가 생성되는 시점)**
  - 관찰 대상의 교차 상태가 변경될 때 : 요소가 뷰포트(또는 루트 요소)에 들어오거나 나갈 때
  - 교차 비율(`intersectionRatio`)이 `threshold` 경계를 넘거나 벗어날 때(EX : `threshold = 1.0`이면 요소가 완전히 보여지는 경우)
  - 레이아웃 변경, 스크롤, 리사이즈 등으로 인해 Intersection(교차) 상태가 변경될 때
  - 브라우저가 내부적으로 업데이트를 모아 콜백을 비동기적으로 호출
3. entries 배열 내용
  - 각 `IntersectionObserverEntry` 객체는 관찰 대상(EX : `entry.target`)과 상태(`isIntersecting`, `intersectionRatio` 등)를 포함
  - 하나의 observer가 여러 요소를 관찰하면, 하나의 콜백 호출에 여러 `entries`가 포함될 수 있음(변화가 있었던 요소들만 포함) 

### IntersectionObserver 옵션
- `root` : 타겟 요소의 가시성을 확인할 때 사용되는 루트 요소(즉, 요소의 조상 요소)
- `rootMargin` : 루트 요소의 경계에 대한 마진 설정(루트 요소의 범위 확장 또는 축소 가능)
- `threshold` : 타겟 요소가 루트 요소와 교차하는 비율 설정(0.0 ~ 1.0 사이의 값 또는 값 배열)
