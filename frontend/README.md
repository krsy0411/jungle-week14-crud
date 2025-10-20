# Frontend

게시판 서비스의 프론트엔드 애플리케이션입니다. React + TypeScript + Vite로 구축되었으며, Tailwind CSS를 사용한 모던한 UI를 제공합니다.

## 기술 스택

### Core
- **React** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구 및 개발 서버

### 상태 관리 & 라우팅
- **Zustand** - 경량 상태 관리
- **React Router DOM** - 클라이언트 사이드 라우팅

### 스타일링
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크

### HTTP 클라이언트
- **Axios** - Promise 기반 HTTP 클라이언트

### 개발 도구
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **Jest** - 유닛 테스트

## 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치

```bash
npm install
```

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_API_URL=http://localhost:3000/api
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 `http://localhost:5173`에서 실행됩니다.

### 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### 프리뷰

```bash
npm run preview
```

빌드된 앱을 로컬에서 미리 볼 수 있습니다.

### 테스트

```bash
npm run test
```

## 학습 정리 문서
- [Axios 인터셉터](/docs/frontend/axios-interceptor.md)