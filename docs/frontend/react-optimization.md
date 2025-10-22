# 리액트의 3가지 최적화 훅
리액트의 성능 최적화 훅 : `useMemo`, `useCallback`, `React.memo`

- `useMemo` : 값(결과)을 메모이제이션(캐시)하여 불필요한 재계산 방지
- `useCallback` : 함수를 메모이제이션하여 동일한 함수 참조(identity)를 유지
- `React.memo` : 컴포넌트를 메모이제이션하여 props(얕은 비교)가 변경되지 않으면 리렌더링을 방지

## useMemo

`useMemo`는 연산 결과(값)를 메모이제이션(캐시)하여 불필요한 재계산을 피하는 훅입니다. 주로 계산 비용이 큰 작업이나, 배열/객체 같은 참조형 값을 반환하여 하위 컴포넌트에 prop으로 넘길 때 사용합니다. `useMemo`는 순수 계산만 수행해야 하며, 내부에서 부수효과(side effect)를 일으키면 안 됩니다.

예시:

```tsx
const filteredPosts = useMemo(() => {
	if (!search) return posts;
	const q = search.trim().toLowerCase();
	return posts.filter(p => p.title.toLowerCase().includes(q));
}, [posts, search]);
```

**언제 사용하나요?**
- 데이터 길이가 크고 필터/정렬 같은 연산이 비용이 큰 경우
- 반환한 값(특히 객체/배열)의 참조(identity)를 유지해 하위 컴포넌트의 불필요한 리렌더를 막고 싶을 때

**주의사항**
- 너무 가벼운 계산에는 오버헤드가 더 클 수 있으므로 프로파일링 후 적용하세요.
- 의존성 배열을 정확히 지정해야 합니다. 누락 시 stale value(구형 클로저 문제)가 발생할 수 있습니다.

---

## useCallback

`useCallback`은 함수를 메모이제이션하여 동일한 함수 참조(identity)를 보장합니다. 주로 부모가 자주 리렌더링할 때, 하위 컴포넌트가 `React.memo`로 감싸져 있고 부모가 콜백을 prop으로 넘겨줄 경우에 사용하면 유용합니다. `useCallback(fn, deps)`은 내부적으로 `useMemo(() => fn, deps)`와 유사합니다.

예시:

```tsx
const handleClick = useCallback(() => {
	setCount(c => c + 1);
}, []);

// 하위 컴포넌트가 React.memo로 감싸져 있으면 onClick 참조가 바뀌지 않아
// 하위 컴포넌트의 불필요한 리렌더를 방지할 수 있다.
<Child onClick={handleClick} />
```

**언제 사용하나요?**
- 하위 컴포넌트가 `React.memo`이고, 부모가 매 렌더마다 새 함수를 생성해 전달함으로써 하위 컴포넌트가 불필요하게 리렌더되는 경우

**주의사항**
- 함수 생성 비용 자체가 거의 없으므로 남용하지 마세요. 또한 deps를 정확히 관리하지 않으면 stale closure가 발생할 수 있습니다.

---

## React.memo

`React.memo`는 컴포넌트를 메모이제이션하는 고차 컴포넌트(HOC)입니다. 기본적으로 얕은 비교(shallow equality)를 사용해 이전 props와 새 props가 동일하면 리렌더를 건너뜁니다. 함수형 컴포넌트를 감싸 사용합니다.

사용법:

```tsx
const Child = React.memo(function Child({ value }) {
	// heavy render
	return <div>{value}</div>;
});
```

커스텀 비교 함수 사용:

```tsx
function areEqual(prevProps, nextProps) {
	return prevProps.value.id === nextProps.value.id;
}

export default React.memo(MyComponent, areEqual);
```

**언제 사용하나요?**
- 렌더 비용이 높은 컴포넌트(복잡한 DOM 트리 또는 많은 연산)가 있고 부모가 자주 리렌더되지만 props는 자주 변하지 않을 때

**주의사항**
- props로 전달되는 객체/배열/함수의 참조가 매번 새로 생성된다면(예: 부모가 inline 객체를 매 렌더마다 생성) `React.memo`의 이점이 무의미해집니다. 이 경우 `useMemo`/`useCallback`으로 참조를 안정화해야 합니다.

---

## 정리 및 권장사항

- 먼저 프로파일링으로 병목을 찾고, 최적화는 측정을 기반으로 적용하는게 좋습니다.
- `useMemo`는 값(특히 배열/객체)을 캐시할 때, `useCallback`은 함수 참조를 유지할 때, `React.memo`는 컴포넌트 리렌더를 건너뛸 때 사용합니다.
- 과도한 적용은 오히려 복잡성과 메모리 오버헤드를 증가시킬 수 있습니다. "비용이 큰 렌더/계산이 있을 때"와 같이 간단한 규칙이 있을 때만 적용합니다.
- `React.StrictMode` 환경에서 mount/unmount가 추가로 발생하므로 최적화 코드가 idempotent하도록 작성해야 합니다.
  
  > **idempotent하도록 작성해라??**
  >
  > 🥕 idempotent(멱등성) : 동일한 입력에 대해 항상 동일한 출력을 반환하는 성질. 즉, 부수효과(side effect)가 없어야 합니다.
  >
  > 1. cleanup은 안전하게 여러 번 실행되어도 문제 없게 작성
  > 2. 동일한 핸들러 참조(함수)를 사용해 이벤트 리스너를 추가/제거
  > 3. 외부 요청(네트워크)은 취소 가능하게 만들기
  > 4. 상태 업데이트는 마운트 여부를 확인 후 수행
  > 5. 등록 전 중복 등록 방지
 
## 예시 조합

```tsx
const Parent = () => {
	const [count, setCount] = useState(0);
	const onAction = useCallback(() => setCount(c => c + 1), []);
	const options = useMemo(() => ({ show: true }), []);

	return <Child onAction={onAction} options={options} />; // Child는 React.memo
}
```

위 패턴은 `Child`가 불필요하게 리렌더되는 것을 방지해 줍니다.
- setCount는 Parent의 리렌더링을 유발(원래라면)
- onAction과 options는 동일한 참조를 유지
  - useMemo는 객체 리터럴의 참조를 유지 : 사실 비용이 큰 계산을 하진 않으므로, 컴포넌트 바깥 변수로 빼는 것도 방법
  - useCallback은 함수 리터럴의 참조를 유지
- onAction과 options는 deps가 빈 배열이므로 최초 생성된 참조를 계속 유지
- Child 컴포넌트는 React.memo로 감싸져 있어, onAction과 options의 참조가 바뀌지 않으므로 리렌더링을 방지
  - 부모 컴포넌트가 setCount로 인해 리렌더링되더라도 Child는 리렌더링되지 않음
- Child 컴포넌트가 props로 받은 onAction을 트리거하고 내부에서 setCount를 호출해도 Parent가 리렌더링될 뿐 Child는 리렌더링되지 않음
  - 물론  Child 컴포넌트 내에서 자신의 상태를 변경하면 Child 컴포넌트 또한 리렌더링