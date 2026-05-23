# CMMC Compliance Management System

**CMMC Level 1 / Level 2 인증 준비를 위한 AS-IS 점검 · 갭 분석 · POA&M 추적 관리 웹 애플리케이션**

| 항목 | 내용 |
|:---|:---|
| 개발 기간 | 2026-05-23 ~ 2026-05-24 (2일, AI-DLC 방법론) |
| 배포 환경 | Vercel (Hobby 플랜) |
| 개발 방법론 | AI-DLC (AI-Driven Development Lifecycle) |
| 빌드 상태 | ✅ 17 라우트, TypeScript 오류 없음 |

---

## 기술 스택

| 계층 | 기술 | 비고 |
|:---|:---|:---|
| **Frontend** | Next.js 15 (App Router) + React 19 + TypeScript | RSC 기본, `'use client'` 명시적 사용 |
| **UI** | Tailwind CSS v4 + shadcn/ui | CSS 변수 기반 테마, 24개 컴포넌트 |
| **Backend** | Next.js Server Actions / API Routes | 별도 서버 없음, 풀스택 단일 프로젝트 |
| **Database** | Neon Postgres (서버리스 PostgreSQL) | Vercel Storage 연동, 무료 0.5GB |
| **ORM** | Drizzle ORM | neon-http 드라이버, 타입 안전성 |
| **인증** | NextAuth.js v5 (Auth.js) | Credentials Provider, JWT 세션 |
| **차트** | Recharts 2 | 대시보드 도메인별 MET 비율 시각화 |
| **폼** | React Hook Form + Zod | 클라이언트·서버 양측 검증 |
| **테스트** | Vitest | 핵심 비즈니스 로직 유닛 테스트 |
| **배포** | Vercel | GitHub 연동 자동 배포 |

---

## 주요 기능

| ID | 기능 | 화면 경로 |
|:---|:---|:---|
| FR-001~003 | Level 1 / Level 2 점검항목 조회 (15개 / 110개) | `/assessment/level1`, `/assessment/level2` |
| FR-004~005 | AS-IS 평가 입력 (MET / NOT MET) + 평가 노트 | 점검화면 내 인라인 폼 |
| FR-006 | 갭 분석 — NOT MET 항목 도메인별 필터링 | `/gap-analysis` |
| FR-007 | POA&M 보완 계획 등록 · 수정 · 삭제 + 상태 추적 | `/poam`, `/poam/new`, `/poam/[id]/edit` |
| FR-008 | 증적(Artifact) 파일명·URL 참조 등록 | `/artifacts` |
| FR-009 | 진행 현황 대시보드 (달성률 + 도메인별 차트) | `/dashboard` |
| FR-010 | SPRS 점수 시뮬레이터 (Level 2, −203 ~ 110점) | `/sprs` |
| FR-011 | 평가 리포트 출력 (인쇄 최적화 + CSV 내보내기) | `/report` |
| FR-013 | 평가 데이터 초기화 / 재평가 회차 시작 | `/settings` (admin 전용) |

---

## AI-DLC 방법론 기반 개발 전 과정 요약

AI-DLC(AI-Driven Development Lifecycle)는 Claude Code 전문 스킬(`/ai-dlc-*`)을 단계별로 호출하여
요구사항 → 설계 → 구현 → 검증까지의 전 과정에서 산출물을 자동 생성하는 방법론이다.

```
Phase 0  요구사항 정의          ← /ai-dlc-requirements
   │
Phase 1  설계 단계 (5 스킬)
   ├─  유즈케이스               ← /ai-dlc-usecase-create
   ├─  화면 목록                ← /ai-dlc-screen-list
   ├─  데이터 모델              ← /ai-dlc-data-design
   ├─  API 설계                 ← /ai-dlc-api-design
   └─  화면 상세 정의           ← /ai-dlc-screen-spec
   │
Phase 2  개발 단계 (5 스킬)
   ├─  Next.js 프로젝트 초기화  ← /ai-dlc-nxt-project-setup
   ├─  구현 계획 수립           ← /ai-dlc-nxt-impl-plan
   ├─  페이지 컴포넌트 생성     ← /ai-dlc-nxt-page-gen
   ├─  Route Handler 생성       ← /ai-dlc-nxt-route-handler-gen
   └─  Server Action 생성       ← /ai-dlc-nxt-server-action-gen
   │
Phase 3  검증 및 배포 (2 스킬)
   ├─  코드 품질 리뷰           ← /ai-dlc-nxt-code-review
   └─  Vercel 배포 가이드       ← /ai-dlc-nxt-deploy-guide
```

---

### Phase 0 — 요구사항 정의 ✅

| 스킬 | 산출물 | 날짜 |
|:---|:---|:---|
| `/ai-dlc-requirements` | `요구사항정의서_CMMC_인증관리시스템_20260523.md` | 2026-05-23 |

- **결과**: FR-001~FR-013 (13개 기능 요구사항), PR·SR·QR·IR·DR·CR 전 분류 작성
- **입력 데이터**: `docs/cmmc-level1.md` (FAR 52.204-21), `docs/cmmc-level2.md` (NIST SP 800-171)

---

### Phase 1 — 설계 단계 ✅ (2026-05-23)

| 스킬 | 산출물 | 주요 내용 |
|:---|:---|:---|
| `/ai-dlc-usecase-create` | `설계산출물/유즈케이스_CMMC_인증관리시스템_20260523.md` | UC-001~UC-010 (10개), FR 커버리지 100%, Mermaid 다이어그램 |
| `/ai-dlc-screen-list` | `설계산출물/화면목록_CMMC_인증관리시스템_20260523.md` | SCR-001~SCR-011 (11개 화면), 역할별 접근 권한 정의 |
| `/ai-dlc-data-design` | `설계산출물/데이터설계서_CMMC_인증관리시스템_20260523.md` | 논리·물리 ERD, 5개 테이블 DDL, Neon Postgres 기준 |
| `/ai-dlc-api-design` | `설계산출물/API설계서_CMMC_인증관리시스템_20260523.yaml` | OpenAPI 3.0, Next.js Route Handler 기반 11개 엔드포인트 |
| `/ai-dlc-screen-spec` | `설계산출물/화면정의서_CMMC_인증관리시스템_20260523.md` | SCR별 레이아웃·입출력·이벤트·API 연계, ASCII UI 목형 |

---

### Phase 2 — 개발 단계 ✅ (2026-05-23~24)

| 스킬 | 산출물 | 실제 결과 |
|:---|:---|:---|
| `/ai-dlc-nxt-project-setup` | `package.json`, `src/` 초기 구조 | Next.js 15 + shadcn/ui + Drizzle ORM + NextAuth.js v5 설정 완료 |
| `/ai-dlc-nxt-impl-plan` | `설계산출물/Next.js구현계획_20260523.md` | 17개 라우트 구조, RSC/CC 분류 기준, 데이터 패칭 전략 |
| `/ai-dlc-nxt-page-gen` | `src/app/(main)/**/*.tsx` | 12개 화면 (대시보드, Level1/2 점검, 갭분석, POA&M×3, 증적, SPRS, 리포트, 설정) |
| `/ai-dlc-nxt-route-handler-gen` | `src/app/api/**/*.ts` | 3개 Route Handler (auth, poam/[id] GET, report/export CSV) |
| `/ai-dlc-nxt-server-action-gen` | `src/actions/*.ts` | 4개 도메인 (evaluations, poam, artifacts, settings) |

**생성된 공유 컴포넌트 (24개):**
- `components/layout/`: `Sidebar.tsx`, `Header.tsx`
- `components/ui/`: shadcn/ui 14개 + `StatusBadge`, `WeightBadge`, `ConfirmDialog`
- `components/assessment/`: `EvaluationForm.tsx`
- `components/dashboard/`: `DomainChart.tsx`
- `components/artifacts/`: `ArtifactAddModal.tsx`, `ArtifactDeleteButton.tsx`

**DB 마스터 데이터 (`src/db/seed.ts`):**
- Level 1 (FAR 52.204-21): **15개** 요구사항 (requirementId: `AC.L1-b.1.i` ~ `SI.L1-b.1.xv`)
- Level 2 (NIST SP 800-171): **110개** 요구사항 (requirementId: `3.1.1` ~ `3.14.7`)
- 합계: **125개** 점검항목 (전 항목 requirementId 고유)

---

### Phase 3 — 검증 및 배포 ✅ (2026-05-24)

| 스킬 | 결과 |
|:---|:---|
| `/ai-dlc-nxt-code-review` | `updatePoam` Zod 검증 추가, Level 2 `objective` 표시 누락 수정 |
| `/ai-dlc-nxt-deploy-guide` | `설계산출물/Vercel배포가이드_CMMC_인증관리시스템_20260524.md` 작성 |

---

### 누락 스킬 보완 (Phase 3 추가 완료)

AI-DLC 원본 계획에 포함되지 않았으나 개발 과정에서 필요성이 확인된 스킬:

#### 1. 테스트 생성 (`/ai-dlc-nxt-test-gen`) — ✅ 보완 완료

**문제**: 비즈니스 규칙(SPRS 계산, POA&M 등록 제한)을 검증하는 자동화 테스트 없음

**보완 내용**:
- Vitest 설치 및 `vitest.config.ts` 설정
- `src/lib/utils.test.ts` — `sprsToPercent`, `formatDate`, `formatDateTime` 유닛 테스트
- `src/lib/cmmc.test.ts` — CMMC 핵심 비즈니스 규칙 테스트 (SPRS 계산, POA&M 등록 가능 여부)
- **20개 테스트, 전체 통과** (`npm test`)

**테스트 커버리지 범위**:

| 테스트 | 검증 내용 |
|:---|:---|
| SPRS 만점 (110) | 전 항목 MET 시 감점 없음 |
| SPRS 감점 | NOT MET 항목 가중치 정확히 합산 |
| SPRS 미평가 | not_evaluated 항목 감점 없음 |
| SPRS 최저점 | 110 − 313 = −203 범위 검증 |
| POA&M Level 1 불가 | Level 1 항목 POA&M 등록 차단 |
| POA&M weight=5 불가 | 가중치 5점 항목 즉시 시정 강제 |
| POA&M weight=1,3 가능 | 정상 케이스 통과 |

#### 2. 공유 컴포넌트 전용 스킬 (`/ai-dlc-nxt-component-gen`) — 계획 수립

**문제**: `EvaluationForm`, `StatusBadge`, `WeightBadge` 등 도메인 컴포넌트가 `/ai-dlc-nxt-page-gen` 범위에 묻혀서 생성됨. 별도 컴포넌트 설계 문서 없음.

**권고사항**: 도메인 컴포넌트 10개 이상인 프로젝트에서는 `/ai-dlc-screen-spec` 이후, `/ai-dlc-nxt-impl-plan` 전에 컴포넌트 계층 설계 단계 추가 권장.

#### 3. DB 시드 설계 스킬 (`/ai-dlc-nxt-db-seed-gen`) — 계획 수립

**문제**: `src/db/seed.ts`의 `requirementId` 일관성 문제(Level 1: 52개 행 → 15개로 재구조화)가 구현 도중 발견됨.

**권고사항**: `/ai-dlc-data-design` 이후 별도 "마스터 데이터 구조 설계" 단계에서 요구사항 식별자(ID) 체계를 명시적으로 정의하면 나중에 재작업을 방지할 수 있음.

---

## 로컬 개발 환경 설정

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local에 아래 값 입력:
#   DATABASE_URL=postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require
#   NEXTAUTH_SECRET=<openssl rand -base64 32 결과>
#   NEXTAUTH_URL=http://localhost:3000
#   ADMIN_EMAIL=admin@example.com
#   ADMIN_PASSWORD=<8자 이상>

# 3. DB 스키마 반영
npm run db:push

# 4. 마스터 데이터 + 관리자 계정 시드
npm run db:seed

# 5. 개발 서버 실행 (Turbopack)
npm run dev
# → http://localhost:3000

# 6. 테스트 실행
npm test
```

---

## 프로젝트 디렉토리 구조 (완성 기준)

```
E:/apps/cmmc/
├── docs/                                     # CMMC 참조 체크리스트
│   ├── cmmc-level1.md                        # FAR 52.204-21 (Level 1, 15개 요구사항)
│   └── cmmc-level2.md                        # NIST SP 800-171A (Level 2, 110개 요구사항)
├── 설계산출물/                                # AI-DLC 설계 산출물
│   ├── 유즈케이스_CMMC_인증관리시스템_20260523.md
│   ├── 화면목록_CMMC_인증관리시스템_20260523.md
│   ├── 데이터설계서_CMMC_인증관리시스템_20260523.md
│   ├── API설계서_CMMC_인증관리시스템_20260523.yaml
│   ├── 화면정의서_CMMC_인증관리시스템_20260523.md
│   ├── Next.js구현계획_20260523.md
│   └── Vercel배포가이드_CMMC_인증관리시스템_20260524.md
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx             # SCR-001 로그인 (인증 없음)
│   │   ├── (main)/                           # 인증 필요 + 사이드바 레이아웃
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx            # SCR-002 진행 현황 대시보드
│   │   │   ├── assessment/
│   │   │   │   ├── level1/page.tsx           # SCR-003 Level 1 점검평가
│   │   │   │   └── level2/page.tsx           # SCR-004 Level 2 점검평가
│   │   │   ├── gap-analysis/page.tsx         # SCR-005 갭 분석
│   │   │   ├── poam/
│   │   │   │   ├── page.tsx                  # SCR-006 POA&M 목록
│   │   │   │   ├── new/page.tsx              # SCR-007 POA&M 등록
│   │   │   │   └── [id]/edit/page.tsx        # SCR-007 POA&M 수정·삭제
│   │   │   ├── artifacts/page.tsx            # SCR-008 증적 관리
│   │   │   ├── sprs/page.tsx                 # SCR-009 SPRS 시뮬레이터
│   │   │   ├── report/page.tsx               # SCR-010 평가 리포트
│   │   │   └── settings/page.tsx             # SCR-011 시스템 설정 (admin)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts   # NextAuth.js 핸들러
│   │   │   ├── poam/[id]/route.ts            # POA&M 단건 조회 (GET)
│   │   │   └── report/export/route.ts        # CSV 내보내기 (GET)
│   │   └── page.tsx                          # / → /dashboard 리다이렉트
│   ├── actions/
│   │   ├── evaluations.ts                    # 평가결과 저장 (UPSERT)
│   │   ├── poam.ts                           # POA&M CRUD
│   │   ├── artifacts.ts                      # 증적 등록·삭제
│   │   └── settings.ts                       # 데이터 초기화 (admin)
│   ├── components/
│   │   ├── layout/Sidebar.tsx
│   │   ├── layout/Header.tsx
│   │   ├── ui/                               # shadcn/ui + 커스텀 컴포넌트
│   │   ├── assessment/EvaluationForm.tsx
│   │   ├── dashboard/DomainChart.tsx
│   │   └── artifacts/
│   ├── db/
│   │   ├── schema.ts                         # Drizzle 스키마 (5개 테이블)
│   │   ├── index.ts                          # DB 연결
│   │   └── seed.ts                           # 마스터 시드 (125개 점검항목)
│   ├── lib/
│   │   ├── auth.ts                           # NextAuth.js 설정
│   │   ├── utils.ts                          # cn(), sprsToPercent() 등
│   │   ├── utils.test.ts                     # 유틸리티 유닛 테스트
│   │   └── cmmc.test.ts                      # CMMC 비즈니스 규칙 테스트
│   ├── types/
│   │   ├── index.ts
│   │   └── next-auth.d.ts
│   └── middleware.ts                         # 인증 + /settings admin 보호
├── Harness/
│   └── SKILL.md                              # AI-DLC 스킬 진행 현황
├── vitest.config.ts
├── CLAUDE.md
└── README.md
```

---

## 핵심 비즈니스 규칙

| 규칙 | 내용 |
|:---|:---|
| **SPRS 점수** | Level 2 전용. `110 − SUM(NOT MET 항목 weight)`. 범위: −203 ~ 110 |
| **POA&M 불가 (Level 1)** | Level 1 항목은 FAR 규정상 즉각 준수 필요 → POA&M 등록 차단 |
| **POA&M 불가 (weight=5)** | 가중치 5점 = Critical High → 즉시 시정 필요, POA&M 유예 불가 |
| **evaluations UNIQUE** | 항목당 평가 1개 (`UNIQUE itemId`). 재평가 시 UPSERT |
| **/settings 관리자 전용** | middleware.ts에서 `role !== 'admin'` 차단 |

---

## 참고 문서

| 문서 | 경로 / 링크 |
|:---|:---|
| CMMC Level 1 체크리스트 | `docs/cmmc-level1.md` |
| CMMC Level 2 체크리스트 | `docs/cmmc-level2.md` |
| 요구사항 정의서 | `요구사항정의서_CMMC_인증관리시스템_20260523.md` |
| Vercel 배포 가이드 | `설계산출물/Vercel배포가이드_CMMC_인증관리시스템_20260524.md` |
| NIST SP 800-171A | https://csrc.nist.gov/publications/detail/sp/800-171a/final |
| FAR 52.204-21 | https://www.acquisition.gov/far/52.204-21 |
| CMMC 공식 규정 (32 CFR Part 170) | https://www.federalregister.gov/documents/2024/10/15/2024-22905 |
| Neon Vercel 연동 가이드 | https://neon.tech/docs/guides/vercel |
| Drizzle ORM 공식 문서 | https://orm.drizzle.team |
