# CMMC Compliance Management System

**CMMC Level 1 / Level 2 인증 준비를 위한 AS-IS 점검 · 갭 분석 · POA&M 추적 관리 웹 애플리케이션**

| 항목 | 내용 |
|:---|:---|
| 개발 기간 | 2026-05-23 ~ 2026-05-25 (3일, AI-DLC 방법론) |
| 배포 환경 | Vercel (Hobby 플랜) |
| 개발 방법론 | AI-DLC (AI-Driven Development Lifecycle) |

---

## 기술 스택

| 계층 | 기술 | 비고 |
|:---|:---|:---|
| **Frontend** | Next.js 15 (App Router) + React 19 + TypeScript | RSC 기본, `'use client'` 명시적 사용 |
| **UI** | Tailwind CSS + shadcn/ui | 반응형 컴포넌트 라이브러리 |
| **Backend** | Next.js Server Actions / API Routes | 별도 서버 없음, 풀스택 단일 프로젝트 |
| **Database** | Neon (Vercel Postgres, serverless PostgreSQL) | Vercel Storage 1클릭 연동, 무료 0.5GB |
| **ORM** | Drizzle ORM | PostgreSQL 어댑터, 타입 안전성 |
| **인증** | NextAuth.js v5 (Auth.js) | Credentials Provider |
| **차트** | Recharts | 대시보드 도메인별 MET 비율 시각화 |
| **배포** | Vercel | GitHub 연동 자동 배포 (main 브랜치 Push) |

---

## 주요 기능

| ID | 기능 | 우선순위 |
|:---|:---|:---:|
| FR-001 | CMMC Level 1 / Level 2 탭 전환 | 상 |
| FR-002 | Level 1 점검항목 조회 (6개 도메인 / 15개 요구사항 / 58개 목표) | 상 |
| FR-003 | Level 2 점검항목 조회 (14개 도메인 / 110개 요구사항) | 상 |
| FR-004 | AS-IS 평가 입력 (MET / NOT MET / 미평가) | 상 |
| FR-005 | 항목별 평가 노트 입력 | 중 |
| FR-006 | 갭 분석 (Gap Analysis) — NOT MET 항목 필터링 | 상 |
| FR-007 | POA&M 보완 계획 등록 및 상태 추적 | 상 |
| FR-008 | 증적(Artifact) 파일명·URL 참조 등록 | 중 |
| FR-009 | 진행 현황 대시보드 (달성률 · 도메인별 차트) | 상 |
| FR-010 | SPRS 점수 시뮬레이터 (Level 2, −203 ~ 110점) | 상 |
| FR-011 | 평가 리포트 출력 (인쇄 최적화) | 중 |
| FR-012 | 점검 진행률 Progress Bar | 중 |
| FR-013 | 평가 데이터 초기화 / 재평가 회차 시작 | 하 |

---

## AI-DLC 방법론 기반 개발 프로세스

AI-DLC(AI-Driven Development Lifecycle)는 Claude Code의 전문 스킬(`/ai-dlc-*`)을 단계별로 호출하여
요구사항 → 설계 → 구현 → 검증의 전 과정에서 산출물을 자동 생성하는 방법론이다.

```
요구사항 정의
  └─▶ 설계 (Phase 1)
        ├─ 유즈케이스 → 화면목록 → 화면정의서
        └─ 데이터설계 → API설계
              └─▶ 개발 (Phase 2)
                    ├─ 프로젝트 초기화 → 구현계획
                    ├─ 페이지 생성 → Route Handlers → Server Actions
                    └─▶ 검증 및 배포 (Phase 3)
                          ├─ 코드 리뷰
                          └─ Vercel 배포
```

---

### Phase 0 — 요구사항 정의 ✅ 완료

| 스킬 | 명령어 | 산출물 |
|:---|:---|:---|
| 요구사항 정의서 작성 | `/ai-dlc-requirements` | `요구사항정의서_CMMC_인증관리시스템_20260523.md` |

---

### Phase 1 — 설계 단계 (Day 1)

순서대로 실행한다. 각 스킬은 이전 단계 산출물을 입력으로 받는다.

#### Step 1-1. 유즈케이스 정의

```
/ai-dlc-usecase-create
```

| 항목 | 내용 |
|:---|:---|
| 입력 | `요구사항정의서_CMMC_인증관리시스템_20260523.md` |
| 산출물 | `설계산출물/유즈케이스_CMMC_인증관리시스템_YYYYMMDD.md` |
| 주요 내용 | FR-001~FR-013 → UC-001~UC-013 매핑, 기본·대안·예외 흐름, Mermaid 다이어그램 |

#### Step 1-2. 화면 목록 도출

```
/ai-dlc-screen-list
```

| 항목 | 내용 |
|:---|:---|
| 입력 | 유즈케이스 문서 |
| 산출물 | `설계산출물/화면목록_CMMC_인증관리시스템_YYYYMMDD.md` |
| 예상 화면 | 로그인, 대시보드, Level1 점검, Level2 점검, 갭분석, POA&M 관리, 증적 관리, 리포트 |

#### Step 1-3. 데이터 모델 설계

```
/ai-dlc-data-design
```

| 항목 | 내용 |
|:---|:---|
| 입력 | 유즈케이스 문서 |
| 산출물 | `설계산출물/데이터설계서_CMMC_인증관리시스템_YYYYMMDD.md` |
| 주요 테이블 | `checklist_items`(마스터), `evaluations`, `poa_and_m`, `artifacts` |
| DB | Neon Postgres (Drizzle ORM, DDL 초안 포함) |

#### Step 1-4. API 설계

```
/ai-dlc-api-design
```

| 항목 | 내용 |
|:---|:---|
| 입력 | 유즈케이스 문서 + 화면 목록 |
| 산출물 | `설계산출물/API설계서_CMMC_인증관리시스템_YYYYMMDD.yaml` |
| 형식 | OpenAPI 3.0 (Next.js Route Handlers 기반) |
| 주요 엔드포인트 | 점검항목 조회, 평가결과 CRUD, 갭분석, SPRS 점수 계산, POA&M CRUD, 증적 CRUD |

#### Step 1-5. 화면 상세 정의

```
/ai-dlc-screen-spec
```

| 항목 | 내용 |
|:---|:---|
| 입력 | 화면 목록 + API 설계서 |
| 산출물 | `설계산출물/화면정의서_CMMC_인증관리시스템_YYYYMMDD.md` |
| 주요 내용 | SCR별 레이아웃·입출력·이벤트·API 연계, ASCII UI 목형 |

---

### Phase 2 — 개발 단계 (Day 2~3)

#### Step 2-1. Next.js 프로젝트 초기화

```
/ai-dlc-nxt-project-setup
```

| 항목 | 내용 |
|:---|:---|
| 생성 파일 | `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `src/` 초기 구조 |
| 추가 설정 | Drizzle ORM + Neon 연결, shadcn/ui 초기화, NextAuth.js v5 설정 |
| 사전 조건 | Vercel 프로젝트 생성 + Neon Postgres 연동 → `DATABASE_URL` 확보 필요 |

#### Step 2-2. 구현 계획 수립

```
/ai-dlc-nxt-impl-plan
```

| 항목 | 내용 |
|:---|:---|
| 입력 | 화면정의서 + API 설계서 |
| 산출물 | `설계산출물/Next.js구현계획_YYYYMMDD.md` |
| 주요 내용 | App Router 라우트 구조, RSC·CC 분류 기준, 데이터 패칭 전략 |

#### Step 2-3. 페이지 컴포넌트 코드 생성

```
/ai-dlc-nxt-page-gen
```

| 항목 | 내용 |
|:---|:---|
| 입력 | 화면정의서(SCR-NNN) + 구현계획서 |
| 생성 경로 | `src/app/**/*.tsx` (`page.tsx`, `layout.tsx`, `loading.tsx`, 컴포넌트) |
| 대상 화면 | 대시보드(FR-009), Level1/2 점검(FR-001~005), 갭분석(FR-006), POA&M(FR-007), 증적(FR-008), 리포트(FR-011) |

#### Step 2-4. API Route Handler 코드 생성

```
/ai-dlc-nxt-route-handler-gen
```

| 항목 | 내용 |
|:---|:---|
| 입력 | API 설계서 (HTTP 메서드·경로·스펙) |
| 생성 경로 | `src/app/api/**/*.ts` |
| 주요 Route | `/api/checklist`, `/api/evaluations`, `/api/gap-analysis`, `/api/sprs`, `/api/poam`, `/api/artifacts` |

#### Step 2-5. Server Action 코드 생성

```
/ai-dlc-nxt-server-action-gen
```

| 항목 | 내용 |
|:---|:---|
| 입력 | 도메인명 + 작업 목록 (평가결과 저장·수정, POA&M CRUD, 증적 등록, 데이터 초기화) |
| 생성 경로 | `src/actions/**/*.ts` |

---

### Phase 3 — 검증 및 배포 (Day 3)

#### Step 3-1. 코드 리뷰

```
/ai-dlc-nxt-code-review
```

생성된 전체 코드를 대상으로 타입 안전성, 보안(SR-001~003), 성능(PR-001~002) 관점에서 검토한다.

#### Step 3-2. Vercel 배포

```
/ai-dlc-nxt-deploy-guide
```

| 항목 | 내용 |
|:---|:---|
| 배포 방식 | GitHub `main` 브랜치 Push → Vercel 자동 배포 |
| 환경변수 | `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` |
| DB 마이그레이션 | Vercel Build Command에 `drizzle-kit push` 포함 |

---

## 로컬 개발 환경 설정

> Phase 2 Step 2-1(`/ai-dlc-nxt-project-setup`) 실행 후 아래 절차를 따른다.

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 편집:
#   DATABASE_URL=postgresql://...@neon.tech/...
#   NEXTAUTH_SECRET=<random-32-chars>
#   NEXTAUTH_URL=http://localhost:3000

# 3. DB 스키마 생성
npx drizzle-kit push

# 4. 마스터 데이터 시드 (Level 1/2 점검항목)
npm run db:seed

# 5. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

---

## 프로젝트 디렉토리 구조 (Phase 2 완료 후 예상)

```
E:/apps/cmmc/
├── docs/                                   # CMMC 참조 체크리스트
│   ├── cmmc-level1.md                      # FAR 52.204-21 (Level 1)
│   └── cmmc-level2.md                      # NIST SP 800-171A (Level 2)
├── 설계산출물/                              # AI-DLC 설계 산출물
│   ├── 유즈케이스_CMMC_*.md
│   ├── 화면목록_CMMC_*.md
│   ├── 화면정의서_CMMC_*.md
│   ├── 데이터설계서_CMMC_*.md
│   ├── API설계서_CMMC_*.yaml
│   └── Next.js구현계획_*.md
├── src/
│   ├── app/
│   │   ├── (auth)/login/                   # 로그인 화면
│   │   ├── dashboard/                      # FR-009 진행 현황 대시보드
│   │   ├── assessment/
│   │   │   ├── level1/                     # FR-002 Level 1 점검화면
│   │   │   └── level2/                     # FR-003 Level 2 점검화면
│   │   ├── gap-analysis/                   # FR-006 갭 분석
│   │   ├── poam/                           # FR-007 POA&M 관리
│   │   ├── artifacts/                      # FR-008 증적 참조
│   │   ├── report/                         # FR-011 리포트 출력
│   │   └── api/                           # Route Handlers
│   │       ├── checklist/
│   │       ├── evaluations/
│   │       ├── gap-analysis/
│   │       ├── sprs/
│   │       ├── poam/
│   │       └── artifacts/
│   ├── components/                         # 공유 UI 컴포넌트
│   ├── actions/                            # Server Actions
│   ├── db/
│   │   ├── schema.ts                       # Drizzle 스키마 정의
│   │   ├── migrations/                     # 마이그레이션 파일
│   │   └── seed.ts                         # 점검항목 마스터 시드
│   └── lib/                               # 유틸리티 함수
├── 요구사항정의서_CMMC_인증관리시스템_20260523.md
├── CLAUDE.md
└── README.md
```

---

## 참고 문서

| 문서 | 경로/링크 |
|:---|:---|
| CMMC Level 1 체크리스트 | `docs/cmmc-level1.md` |
| CMMC Level 2 체크리스트 | `docs/cmmc-level2.md` |
| 요구사항 정의서 | `요구사항정의서_CMMC_인증관리시스템_20260523.md` |
| NIST SP 800-171A | https://csrc.nist.gov/publications/detail/sp/800-171a/final |
| FAR 52.204-21 | https://www.acquisition.gov/far/52.204-21 |
| CMMC 공식 규정 (32 CFR Part 170) | https://www.federalregister.gov/documents/2024/10/15/2024-22905 |
| Neon Vercel 연동 가이드 | https://neon.tech/docs/guides/vercel |
| Drizzle ORM 공식 문서 | https://orm.drizzle.team |
