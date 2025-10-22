# useEffect Cleanup
- 부수 효과(side effect)를 수행하기 위한 훅 : 선택적으로 클린업 함수 반환 가능
- 컴포넌트 언마운드 시점, effect 재실행 시점(의존성 배열이 바뀔 때)에 호출되어 자원 해제, 리스너 제거와 같은 정리 작업을 수행

=> 메모리 누수, 중복 이벤트 등록, 잘못된 동작 방지 가능

## Cleanup 함수 호출 시점
- 컴포넌트가 언마운트될 때
- effect가 재실행되기 직전 : 의존성 배열(dependency array)에 포함된 값이 변경되어 effect가 다시 실행되기 전

## Cleanup 함수의 일반적 사용 사례
- 이벤트 리스너 제거(window.resize, scroll 등)
- 타이머/인터벌 정리(setTimeout/clearTimeout, setInterval/clearInterval)
- 외부 라이브러리 구독 취소(unsubscribe)
- IntersectionObserver 또는 MutationObserver 해제
- 네트워크 취소 요청(AbortController 사용 시)

## 예제 : Infinite Scroll에서 IntersectionObserver 정리
> 🥕 IntersectionObserver를 생성하고 `observer.observe(currentTarget)`을 호출해 감시 시작. useEffect는 마지막에 클린업 함수를 반환

```tsx
useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      // 추가 데이터 로드
    }
  }, { threshold: 0.1 });

  const currentTarget = sentinelRef.current;
  if (currentTarget) {
    observer.observe(currentTarget);
  }

  // Cleanup 함수 반환
  return () => {
    if (currentTarget) {
      observer.unobserve(currentTarget);
    }
  };
}, [/* 의존성 배열 */]);
```

클린업 함수의 동작 의미 :
- 의존성 `[hasMore, isLoading, onLoadMore, threshold]` 중 하나가 바뀌면(또는 컴포넌트가 언마운트되면) 이전 effect의 클린업 실행
- 클린업은 이전에 관찰하던 `currentTarget`이 존재하면 그 타겟에 대해 `observer.unobserve`를 호출해 옵저버가 더 이상 해당 엘리먼트를 감시하지 않게 함
- 이후 effect가 재실행되면 새로운 IntersectionObserver가 생성되고, (가능하면) 다시 현재의 target을 observe 하게 함

=> 이렇게 하면 동일 DOM에 대해 중복 관찰이나 메모리 누수를 회피 가능

## 주의사항 & 권장 패턴
1. **로컬 변수로 target 저장** : cleanup 함수에서 참조할 수 있도록 effect 내부에서 `currentTarget` 같은 로컬 변수에 `sentinelRef.current` 저장 권장
2. **observer 인스턴스 재사용 고려** : effect가 자주 재실행되는 경우, observer를 매번 새로 생성하는 대신 `useRef`에 저장해 재사용하는 방법도 있음
3. **observer 자체도 disconnect 고려** : `observer.disconnect()`를 호출해 모든 타겟에 대한 관찰을 중지하는 것도 고려 가능(더 안전)
4. **의존성 배열 관리** : effect 내에서 사용하는 모든 값(특히 콜백 함수, 상태 값 등)을 의존성 배열에 포함시켜야 함. 그렇지 않으면 stale closure 문제가 발생할 수 있음
5. **strict mode 주의** : React의 Strict Mode에서는 개발 모드에서 의도적으로 effect를 두 번 실행하므로, cleanup 함수가 올바르게 동작하는지 반드시 확인해야 함