# ARCHITECT.md — 시스템 아키텍처 설계서

---

## 1. 아키텍처 개요

```
┌────────────────────────────────────────────────────────┐
│                    사용자 브라우저                        │
│           Next.js App (React Server Components)         │
└───────────────────────┬────────────────────────────────┘
                        │ HTTPS (Vercel Edge Network)
┌───────────────────────▼────────────────────────────────┐
│                  Vercel Platform                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │            Next.js 15 (App Router)              │   │
│  │                                                  │   │
│  │  ┌──────────────┐   ┌───────────────────────┐   │   │
│  │  │  RSC Pages   │   │  Server Actions        │   │   │
│  │  │  (서버 렌더링) │   │  (폼·뮤테이션 처리)  │   │   │
│  │  └──────────────┘   └───────────────────────┘   │   │
│  │                                                  │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │  API Route Handlers  (app/api/**)         │   │   │
│  │  │  (외부 데이터 요청 · JSON 응답)            │   │   │
│  │  └────────────────────┬─────────────────────┘   │   │
│  └───────────────────────┼─────────────────────────┘   │
│                           │ DATABASE_URL (자동 주입)     │
└───────────────────────────┼────────────────────────────┘
                            │ libpq / @neondatabase/serverless
┌───────────────────────────▼────────────────────────────┐
│              Neon Postgres (Vercel Storage)              │
│                                                          │
│  checklist_items │ evaluations │ poa_and_m │ artifacts   │
└────────────────────────────────────────────────────────┘
```

---

## 2. 기술 스택 상세

### Frontend / UI

| 기술 | 버전 | 역할 |
|:---|:---|:---|
| Next.js | 15.x | App Router, RSC, Server Actions |
| React | 19.x | UI 렌더링 |
| TypeScript | 5.x | 타입 안전성 (strict 모드) |
| Tailwind CSS | 3.x | 유틸리티 기반 스타일링 |
| shadcn/ui | 최신 | Radix UI 기반 컴포넌트 라이브러리 |
| Recharts | 2.x | 대시보드 차트 (도메인별 MET 비율) |
| React Hook Form | 7.x | 폼 상태 관리 |
| Zod | 3.x | 입력 유효성 검사 스키마 |

### Backend / Data

| 기술 | 버전 | 역할 |
|:---|:---|:---|
| Node.js | 20.x (LTS) | Next.js 런타임 |
| Drizzle ORM | 0.30.x | PostgreSQL ORM, 타입 안전 쿼리 |
| @neondatabase/serverless | 최신 | Neon Postgres 서버리스 드라이버 |
| NextAuth.js (Auth.js) | v5 | 세션 기반 인증 |

### Infrastructure

| 기술 | 역할 |
|:---|:---|
| Vercel (Hobby) | 서버리스 배포, CDN, 자동 HTTPS |
| Neon Postgres | 서버리스 PostgreSQL (Vercel Storage) |
| GitHub | 소스 버전 관리, Vercel CI/CD 연동 |

---

## 3. App Router 라우트 구조

```
src/app/
├── layout.tsx                    # 루트 레이아웃 (전역 폰트·Provider)
├── page.tsx                      # 루트 → /dashboard 리다이렉트
│
├── (auth)/
│   └── login/
│       └── page.tsx              # SCR-001 로그인 화면
│
├── dashboard/
│   └── page.tsx                  # SCR-002 대시보드 (FR-009, FR-012)
│
├── assessment/
│   ├── layout.tsx                # Level 탭 공통 레이아웃 (FR-001)
│   ├── level1/
│   │   └── page.tsx              # SCR-003 Level 1 점검 (FR-002, FR-004, FR-005)
│   └── level2/
│       └── page.tsx              # SCR-004 Level 2 점검 (FR-003, FR-004, FR-005)
│
├── gap-analysis/
│   └── page.tsx                  # SCR-005 갭 분석 (FR-006)
│
├── poam/
│   ├── page.tsx                  # SCR-006 POA&M 목록 (FR-007)
│   └── [id]/
│       └── page.tsx              # POA&M 상세·수정
│
├── artifacts/
│   └── page.tsx                  # SCR-007 증적 관리 (FR-008)
│
├── sprs/
│   └── page.tsx                  # SCR-008 SPRS 시뮬레이터 (FR-010)
│
├── report/
│   └── page.tsx                  # SCR-009 평가 리포트 (FR-011)
│
├── settings/
│   └── page.tsx                  # SCR-010 설정·초기화 (FR-013)
│
└── api/
    ├── auth/[...nextauth]/
    │   └── route.ts              # NextAuth.js 핸들러
    ├── checklist/
    │   └── route.ts              # GET /api/checklist?level=1|2
    ├── evaluations/
    │   └── route.ts              # GET|POST|PUT /api/evaluations
    ├── gap-analysis/
    │   └── route.ts              # GET /api/gap-analysis?level=1|2
    ├── sprs/
    │   └── route.ts              # GET /api/sprs
    ├── poam/
    │   ├── route.ts              # GET|POST /api/poam
    │   └── [id]/
    │       └── route.ts          # PUT|DELETE /api/poam/:id
    └── artifacts/
        ├── route.ts              # GET|POST /api/artifacts
        └── [id]/
            └── route.ts          # DELETE /api/artifacts/:id
```

---

## 4. 데이터 모델 (논리 ERD)

```
checklist_items (점검항목 마스터 — 읽기 전용 Seed)
├── id              PK, UUID
├── level           ENUM('1', '2')
├── domain_code     VARCHAR(5)   -- 'AC', 'IA', 'MP' 등
├── domain_name     VARCHAR(100) -- '접근 통제' 등
├── requirement_id  VARCHAR(20)  -- 'AC.L1-b.1.i', '3.1.1' 등
├── requirement     TEXT         -- 요구사항 내용
├── objective       TEXT         -- 세부 평가목표 (Level 1)
├── weight          INTEGER      -- 가중치: 1, 3, 5 (Level 2 전용)
└── sort_order      INTEGER

evaluations (평가 결과)
├── id              PK, UUID
├── checklist_id    FK → checklist_items.id
├── status          ENUM('met', 'not_met', 'not_evaluated')
├── note            TEXT         -- 평가 노트
├── evaluated_by    VARCHAR(100) -- 평가자
├── evaluated_at    TIMESTAMP
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP

poa_and_m (보완 계획)
├── id              PK, UUID
├── checklist_id    FK → checklist_items.id
├── action          TEXT         -- 조치 내용
├── responsible     VARCHAR(100) -- 책임자
├── target_date     DATE         -- 목표 완료일
├── status          ENUM('planned', 'in_progress', 'completed')
├── completed_at    TIMESTAMP    -- 완료일 (완료 시 자동)
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP

artifacts (증적 참조)
├── id              PK, UUID
├── checklist_id    FK → checklist_items.id
├── file_name       VARCHAR(500) -- 증적 파일명
├── url             TEXT         -- 증적 URL (선택)
├── note            TEXT         -- 비고
├── registered_at   DATE         -- 등록일
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP

users (사용자 — NextAuth.js 연동)
├── id              PK, UUID
├── email           VARCHAR(255) UNIQUE
├── password_hash   VARCHAR(255)
├── role            ENUM('admin', 'user')
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP
```

---

## 5. 컴포넌트 구조 원칙

### RSC vs Client Component 분류 기준

| 기준 | RSC (기본) | Client Component (`'use client'`) |
|:---|:---|:---|
| 데이터 패칭 | DB 직접 조회 (Drizzle) | Server Actions 호출 후 상태 업데이트 |
| 인터랙션 | 없음 | 있음 (onClick, onChange 등) |
| 상태 | 없음 | useState, useEffect 사용 |
| 예시 | 점검항목 목록 렌더링 | MET/NOT MET 라디오 버튼, 폼 |

### Server Actions vs Route Handlers 분류 기준

| 상황 | 선택 | 이유 |
|:---|:---|:---|
| 폼 제출·뮤테이션 | **Server Actions** | Next.js 폼 처리 패턴 |
| 외부 클라이언트 접근 필요 | **Route Handlers** | REST API 노출 |
| 실시간 데이터 조회 (RSC) | **RSC 직접 DB 쿼리** | 불필요한 네트워크 왕복 제거 |
| CSV 다운로드 | **Route Handlers** | 스트리밍 응답 필요 |

---

## 6. 보안 아키텍처

```
[미들웨어 (middleware.ts)]
  └── 모든 요청 인터셉트
       ├── /login → 패스스루
       ├── /api/auth/** → 패스스루
       └── 그 외 → 세션 유효성 검사
            ├── 유효 → 요청 처리
            └── 무효 → /login 리다이렉트

[Server Actions]
  └── auth() 호출로 세션 확인
       └── 세션 없으면 예외 반환

[Route Handlers]
  └── 요청 헤더의 세션 쿠키 검증
       └── 미인증 → 401 Unauthorized
```

---

## 7. 성능 최적화 전략

| 전략 | 적용 대상 | 목표 |
|:---|:---|:---|
| React Server Components | 점검항목 목록 | 초기 번들 크기 최소화 |
| 정적 JSON Seed | checklist_items 마스터 | DB 쿼리 감소, 응답 속도 향상 |
| `loading.tsx` Skeleton UI | 모든 페이지 | LCP 개선 |
| 도메인별 아코디언 | Level 2 110개 항목 | DOM 렌더링 최소화 |
| Vercel Edge Network | 정적 자산 | 글로벌 CDN 캐싱 |

---

## 8. 개발 환경 설정 순서

```bash
# 1. Next.js 15 프로젝트 생성 (/ai-dlc-nxt-project-setup 실행)
npx create-next-app@latest cmmc --typescript --tailwind --app

# 2. 의존성 추가
npm install drizzle-orm @neondatabase/serverless
npm install next-auth@beta
npm install zod react-hook-form @hookform/resolvers
npm install recharts
npm install -D drizzle-kit

# 3. shadcn/ui 초기화
npx shadcn@latest init

# 4. 환경변수 설정 (.env.local)
DATABASE_URL=postgresql://...@neon.tech/...
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# 5. DB 스키마 푸시
npx drizzle-kit push

# 6. 마스터 데이터 시드
npm run db:seed

# 7. 개발 서버 실행
npm run dev
```
