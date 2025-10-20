# 인터셉터(Interceptor)
요청이나 응답을 가로채서 중간에 처리하는 미들웨어

## 요청 인터셉터(Request Interceptor)
- API 호출 전에 실행됨 : 요청 헤더 수정, 인증 토큰 추가 등
- 각 메서드마다 일일이 설정할 필요 없이 공통 작업 수행 가능

**장점** :
- 중복 코드 제거
- 일관된 요청 처리

**예시** :
```javascript
import axios from 'axios';
// 요청 인터셉터 추가
axios.interceptors.request.use(
  function (config) {
    // 요청이 전달되기 전에 수행할 작업
    console.log('요청이 시작되었습니다:', config);
    // 예: 인증 토큰 추가
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    // 요청 오류가 있는 경우 수행할 작업
    return Promise.reject(error);
  }
);
```

## 응답 인터셉터(Response Interceptor)
- API 응답 후 실행됨 : 응답 데이터 가공, 오류 처리 등
- 공통 응답 처리 로직을 중앙화 가능

**장점** :
- 전역 에러 처리
- 코드 중복 제거

**예시** :
```javascript
import axios from 'axios';
// 응답 인터셉터 추가
this.client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 에러 핸들링 전략

1. **전역 에러 처리** : 응답 인터셉터에서 공통 에러 처리 로직 구현
  ```javascript
  this.client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response.status === 401) {
        // 인증 오류 처리
      }
      return Promise.reject(error); // 나머지는 메서드로 전달
    }
  )
  ```
2. **개별 메서드 에러 처리** : 특정 API 호출에 대한 별도 에러 처리 로직 추가
  ```javascript
  async function deletePost(id: number): Promise<void> {
    try {
      await this.client.delete(`/posts/${id}`);
    } catch (error) {
      if (error.response.status === 404) {
        console.error('게시물을 찾을 수 없습니다.');
      }

      if (error.response.status === 403) {
        console.error('삭제 권한이 없습니다.');
      }

      throw new Error('게시물 삭제에 실패했습니다.');
    }
  }
  ```
3. **사용자 알림** : 에러 발생 시 사용자에게 알림 표시 (예: 토스트 메시지)
  ```javascript
  this.client.interceptors.response.use(
    (response) => response,
    (error) => {
      // ...에러 처리

      // 사용자에게 알림 표시
      showToast('오류가 발생했습니다. 다시 시도해주세요.');

      return Promise.reject(error);
    }
  )
  ```

### 인터셉트에서 모든 에러를 처리하지 않고 개별 메서드에서 처리하도록 하는 이유
- 특정 API 호출에 대한 맞춤형 에러 처리 가능
- 사용자 경험 개선 : 상황에 맞는 피드백 제공
- 유지보수 용이 : 공통 로직과 개별 로직 분리

```javascript
// ❌ 나쁜 예: 인터셉터에서 403 처리
interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      alert('권한이 없습니다'); // 너무 일반적
    }
  }
);
```

- 위와 같이 모든 403 에러를 동일하게 처리하면, 사용자가 왜 권한이 없는지 알기 어려움
- 개별 메서드에서 상황에 맞는 에러 메시지를 제공하는 것이 더 효과적임