# 게시판 프로젝트
- 한국어로 답변해주세요.
- 이 프로젝트는 간단한 CRUD 기능을 갖춘 게시판 애플리케이션을 구현하는 것을 목표로 합니다. 이후 고도화를 위해 여러 기술들을 추가할 예정입니다.
- 프로젝트는 다음과 같은 주요 기능을 포함합니다:
    - 게시글 작성, 조회, 수정, 삭제
    - 댓글 작성, 조회, 수정, 삭제
    - 사용자 인증 및 권한 관리
- 프로젝트는 다음과 같은 기술 스택을 사용합니다:
    - 프론트엔드 : TypeScript, React, React Router, Zustand, Axios, Tailwind CSS, Vite, ESLint, Prettier, Jest, React Testing Library, Docker, GitHub Actions
    - 백엔드 : TypeScript, NestJS, TypeORM, PostgreSQL, JWT, Passport, Swagger, Jest, Docker, GitHub Actions, Nginx, Redis, Playwright
- 프로젝트는 RESTful API 아키텍처를 따릅니다.
- 프로젝트는 PostgreSQL을 데이터베이스로 사용합니다.
- 프로젝트는 Redis를 캐시 및 세션 관리에 사용합니다.
- 프로젝트는 JWT를 사용하여 사용자 인증을 처리합니다.
- 프로젝트는 TypeORM을 사용하여 데이터베이스와 상호작용합니다.
- 프로젝트는 다음과 같은 디렉토리 구조를 가집니다:
```
.
├── backend
│   ├── src
│   │   ├── modules
│   │   │   ├── auth
│   │   │   ├── users
│   │   │   ├── posts
│   │   │   └── comments
│   │   ├── common
│   │   ├── config
│   │   └── main.ts
│   ├── test
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── ormconfig.json
│   ├── jest.config.js
│   └── package.json
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── hooks
│   │   ├── services
│   │   ├── styles
│   │   └── App.tsx
│   ├── public
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── vite.config.ts
│   ├── jest.config.js
│   └── package.json
├── .github
│   ├── workflows
│   │   ├── backend-ci.yml
│   │   └── frontend-ci.yml
│   └── copilot-instructions.md
├── nginx
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```
- 프로젝트는 GitHub Actions를 사용하여 CI/CD 파이프라인을 구축합니다.
- 프로젝트는 Docker를 사용하여 컨테이너화됩니다.
- 프로젝트는 Nginx를 사용하여 리버스 프록시 및 정적 파일 제공을 처리합니다.
- 프로젝트는 Swagger를 사용하여 API 문서를 자동으로 생성합니다.
- 프로젝트는 테스트 주도 개발(TDD) 방식을 따릅니다.
- 프로젝트는 ESLint와 Prettier를 사용하여 코드 품질과 일관성을 유지합니다.
- 프로젝트는 Playwright를 사용하여 엔드투엔드 테스트를 수행합니다.
- 프로젝트는 최소한의 코드 중복과 높은 응집도를 유지하도록 설계됩니다.
- 프로젝트는 최소한의 코드 수정으로 새로운 기능을 추가할 수 있도록 설계됩니다.
- 프로젝트는 확장성과 유지보수성을 고려하여 설계됩니다.