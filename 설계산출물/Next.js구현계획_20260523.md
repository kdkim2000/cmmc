# Next.js 구현 계획서

| 항목 | 내용 |
|:---|:---|
| 사업명 | CMMC 인증 준비 관리 시스템 |
| 기술 스택 | Next.js 15 (App Router, Turbopack), TypeScript 5, Tailwind CSS 4, shadcn/ui, Drizzle ORM, Neon Postgres, NextAuth.js v5 |
| 작성 일시 | 2026-05-23 |
| 버전 | v0.1 |

---

## 1. 라우트 구조

```
src/app/
├── (auth)/                          # 인증 없음 (미들웨어 제외)
│   └── login/
│       └── page.tsx                 # SCR-001 ✅ 완성
│
├── (main)/                          # auth() 필수 + 사이드바 레이아웃
│   ├── layout.tsx                   # RSC — auth() 세션 확인 + Sidebar + Header
│   ├── dashboard/
│   │   └── page.tsx                 # SCR-002
│   ├── assessment/
│   │   ├── level1/
│   │   │   └── page.tsx             # SCR-003
│   │   └── level2/
│   │       └── page.tsx             # SCR-004
│   ├── gap-analysis/
│   │   └── page.tsx                 # SCR-005
│   ├── poam/
│   │   ├── page.tsx                 # SCR-006
│   │   ├── new/
│   │   │   └── page.tsx             # SCR-007 (등록)
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx         # SCR-007 (수정)
│   ├── artifacts/
│   │   └── page.tsx                 # SCR-008
│   ├── sprs/
│   │   └── page.tsx                 # SCR-009
│   ├── report/
│   │   └── page.tsx                 # SCR-010
│   └── settings/
│       └── page.tsx                 # SCR-011 (admin only)
│
└── api/                             # Route Handlers
    ├── auth/[...nextauth]/
    │   └── route.ts                 # NextAuth.js handlers ✅
    ├── checklist/
    │   └── route.ts                 # GET ?level=1|2
    ├── evaluations/
    │   └── route.ts                 # GET, POST (UPSERT)
    ├── gap-analysis/
    │   └── route.ts                 # GET ?level=1|2
    ├── sprs/
    │   └── route.ts                 # GET
    ├── dashboard/
    │   └── route.ts                 # GET
    ├── poam/
    │   ├── route.ts                 # GET, POST
    │   └── [id]/
    │       └── route.ts             # PUT, DELETE
    ├── artifacts/
    │   ├── route.ts                 # GET, POST
    │   └── [id]/
    │       └── route.ts             # DELETE
    ├── report/
    │   ├── route.ts                 # GET ?level=1|2|all
    │   └── export/
    │       └── route.ts             # GET ?format=csv
    └── settings/
        └── reset/
            └── route.ts             # DELETE (admin)
```

---

## 2. RSC / CC 분류

### 2-1. 페이지 컴포넌트

| SCR | 경로 | 유형 | 근거 |
|:---|:---|:---:|:---|
| SCR-001 | `/login` | **CC** | React Hook Form, signIn() 이벤트 |
| SCR-002 | `/dashboard` | **RSC** | DB 직접 조회, SEO 불필요하나 서버 데이터만 표시 |
| SCR-003 | `/assessment/level1` | **RSC** | Drizzle로 체크리스트 조회, 아코디언 상태만 CC 분리 |
| SCR-004 | `/assessment/level2` | **RSC** | 동일, SPRS 점수 갱신 후 router.refresh() |
| SCR-005 | `/gap-analysis` | **RSC** | searchParams로 level 필터, DB 직접 조회 |
| SCR-006 | `/poam` | **RSC** | searchParams(status 필터) → Drizzle 쿼리 |
| SCR-007 | `/poam/new`, `/poam/[id]/edit` | **CC** | React Hook Form, Zod 유효성, 날짜 입력 |
| SCR-008 | `/artifacts` | **RSC** | 목록은 RSC, 등록 모달만 CC Dialog |
| SCR-009 | `/sprs` | **RSC** | Drizzle 직접 계산, 순수 데이터 표시 |
| SCR-010 | `/report` | **RSC** | 대부분 서버 데이터; Level 라디오만 CC 분리 |
| SCR-011 | `/settings` | **CC** | AlertDialog 상태, DELETE 확인 플로우 |

### 2-2. 공통 컴포넌트

| 컴포넌트 | 파일 | 유형 | 이유 |
|:---|:---|:---:|:---|
| Sidebar | `components/layout/Sidebar.tsx` | **CC** | usePathname() 활성 메뉴 |
| Header | `components/layout/Header.tsx` | **RSC** | auth() 세션 표시, 이벤트 없음 |
| EvaluationForm | `components/assessment/EvaluationForm.tsx` | **CC** | 라디오 상태, 저장 버튼, Server Action 호출 |
| DomainChart | `components/dashboard/DomainChart.tsx` | **CC** | Recharts (브라우저 전용) |
| WeightBadge | `components/ui/WeightBadge.tsx` | **RSC** | weight prop → 색상 배지, 순수 표시 |
| StatusBadge | `components/ui/StatusBadge.tsx` | **RSC** | status prop → 색상 배지, 순수 표시 |
| ArtifactModal | `components/artifacts/ArtifactModal.tsx` | **CC** | Dialog 상태, 폼 입력, Server Action |
| ConfirmDialog | `components/ui/ConfirmDialog.tsx` | **CC** | AlertDialog 열기/닫기 상태 |
| LevelRadio | `components/report/LevelRadio.tsx` | **CC** | 라디오 변경 → URL 쿼리 업데이트 |

---

## 3. 데이터 패칭 전략

### 3-1. RSC 직접 DB 쿼리 (기본 전략)

Next.js 15 RSC에서 Drizzle ORM으로 Neon Postgres를 직접 쿼리한다.
API Route를 경유하지 않아 네트워크 왕복이 없다.

```typescript
// ✅ RSC 페이지 패턴 (예: /dashboard/page.tsx)
import { db } from '@/db'
import { checklistItems, evaluations, poaAndM, artifacts } from '@/db/schema'

export default async function DashboardPage() {
  const [evalStats, poamStats, artifactCount] = await Promise.all([
    db.select(...).from(evaluations).innerJoin(...),
    db.select(...).from(poaAndM),
    db.select({ count: count() }).from(artifacts),
  ])
  return <DashboardView data={...} />
}
```

| 페이지 | 캐싱 전략 | 이유 |
|:---|:---|:---|
| `/dashboard` | `no-store` (dynamic) | 매 요청마다 최신 데이터 |
| `/assessment/level1,2` | `no-store` | 평가 결과 실시간 반영 |
| `/gap-analysis` | `no-store` | 평가 상태 변경 즉시 반영 |
| `/sprs` | `no-store` | SPRS 점수 실시간 |
| `/report` | `no-store` | 보고서 정확성 |
| `/poam` | `no-store` | POA&M 상태 변경 즉시 반영 |

> 모든 `(main)` 페이지는 `export const dynamic = 'force-dynamic'` 선언 또는
> Drizzle 쿼리 자체가 `no-store` 시맨틱을 보장함.

### 3-2. Server Actions (뮤테이션)

폼 제출 및 데이터 변경은 Server Actions를 우선 사용한다.

```
src/actions/
├── evaluations.ts   # saveEvaluation(itemId, status, note)
├── poam.ts          # createPoam(data), updatePoam(id, data), deletePoam(id)
├── artifacts.ts     # createArtifact(data), deleteArtifact(id)
└── settings.ts      # resetEvaluationData()
```

**Server Action 호출 후 UI 갱신 패턴**:
```typescript
// Client Component에서
const [isPending, startTransition] = useTransition()
const router = useRouter()

async function handleSave() {
  startTransition(async () => {
    const result = await saveEvaluation(itemId, status, note)
    if (result.success) {
      toast.success('저장되었습니다')
      router.refresh()  // RSC 재실행 → 최신 데이터 반영
    } else {
      toast.error(result.error)
    }
  })
}
```

### 3-3. Route Handlers (외부 노출 API)

브라우저에서 직접 호출하거나 파일 다운로드가 필요한 경우에만 사용.

| Route Handler | 사용 이유 |
|:---|:---|
| `GET /api/report/export` | CSV 파일 다운로드 (`Content-Disposition` 헤더) |
| `DELETE /api/settings/reset` | 직접 fetch로 호출 가능 (Server Action 대안) |
| `GET /api/sprs` | SCR-004에서 저장 후 SPRS 점수 즉시 조회 용도 |
| 나머지 GET APIs | RSC가 DB 직접 쿼리하므로 실제 호출되지 않으나 명세 유지 |

---

## 4. Server Actions 명세

### 4-1. `src/actions/evaluations.ts`

```typescript
'use server'
// saveEvaluation(itemId: string, status: 'met'|'not_met'|'not_evaluated', note: string)
// → db.insert(evaluations).values({...}).onConflictDoUpdate({target: itemId, set: {...}})
// 반환: { success: boolean, error?: string }
```

**비즈니스 규칙**:
- `status === 'not_met' && level === 1` → POA&M 등록 불가 (안내만)
- `status === 'not_met' && weight === 5` → POA&M 등록 불가 경고 반환

### 4-2. `src/actions/poam.ts`

```typescript
'use server'
// createPoam(data: PoamFormData) → db.insert(poaAndM)
// updatePoam(id: string, data: PoamFormData) → db.update(poaAndM)
// deletePoam(id: string) → db.delete(poaAndM)
```

**비즈니스 규칙 검증** (서버에서):
- `itemId`가 Level 1 항목이면 `createPoam` 거부 (422 반환)
- `itemId`가 weight=5 항목이면 `createPoam` 거부 (423 반환)

### 4-3. `src/actions/artifacts.ts`

```typescript
'use server'
// createArtifact(data: ArtifactFormData) → db.insert(artifacts)
//   fileName과 url 중 하나 이상 필수 (Zod 유효성)
// deleteArtifact(id: string) → db.delete(artifacts)
```

### 4-4. `src/actions/settings.ts`

```typescript
'use server'
// resetEvaluationData() → admin 역할 검증 후 evaluations, poaAndM, artifacts 전체 삭제
```

---

## 5. 공통 타입 정의

```typescript
// src/types/index.ts

export type EvalStatus = 'met' | 'not_met' | 'not_evaluated'
export type PoamStatus = 'planned' | 'in_progress' | 'completed'
export type UserRole = 'admin' | 'user'
export type Level = 1 | 2

export interface ChecklistItem {
  itemId: string
  level: Level
  domainCode: string
  requirementId: string
  requirement: string
  objective?: string     // Level 1 전용
  weight?: number        // Level 2 전용
  sortOrder: number
  // join 결과
  evalStatus?: EvalStatus
  evalNote?: string
  poamStatus?: PoamStatus
}

export interface DashboardStats {
  level1: { total: number; met: number; notMet: number }
  level2: { total: number; met: number; notMet: number }
  sprsScore: number
  poamStats: { planned: number; inProgress: number; completed: number }
  artifactCount: number
  domainStats: DomainStat[]
}

export interface DomainStat {
  level: Level
  domainCode: string
  total: number
  met: number
  notMet: number
  notEvaluated: number
}

export interface SprsResult {
  score: number         // 110 - SUM(NOT MET weights)
  totalItems: number
  evaluatedItems: number
  metItems: number
  notMetItems: NotMetItem[]
}

export interface NotMetItem extends ChecklistItem {
  weight: number
  poamStatus?: PoamStatus
}
```

---

## 6. 구현 순서 (우선순위)

### Phase 2-3: 페이지 생성

| 순서 | 대상 | 선행 조건 | 의존 컴포넌트 |
|:---|:---|:---|:---|
| 1 | 공통 타입 `src/types/index.ts` | — | — |
| 2 | `(main)/layout.tsx` | types | Sidebar, Header |
| 3 | `WeightBadge`, `StatusBadge` | types | shadcn Badge |
| 4 | `ConfirmDialog` | — | shadcn AlertDialog |
| 5 | SCR-002 `/dashboard` | layout, DomainChart | Recharts |
| 6 | SCR-003/004 `/assessment/level1,2` | EvaluationForm | shadcn Accordion, RadioGroup |
| 7 | SCR-005 `/gap-analysis` | WeightBadge, StatusBadge | — |
| 8 | SCR-006/007 `/poam`, `/poam/new`, `/poam/[id]/edit` | ConfirmDialog | shadcn Select |
| 9 | SCR-008 `/artifacts` | ArtifactModal | shadcn Dialog |
| 10 | SCR-009 `/sprs` | WeightBadge | — |
| 11 | SCR-010 `/report` | LevelRadio | — |
| 12 | SCR-011 `/settings` | ConfirmDialog | — |

### Phase 2-4: Route Handler 생성

| 순서 | 파일 | 메서드 |
|:---|:---|:---|
| 1 | `api/checklist/route.ts` | GET ?level=1\|2 |
| 2 | `api/evaluations/route.ts` | GET, POST (UPSERT) |
| 3 | `api/sprs/route.ts` | GET |
| 4 | `api/dashboard/route.ts` | GET |
| 5 | `api/gap-analysis/route.ts` | GET ?level=1\|2 |
| 6 | `api/poam/route.ts` | GET, POST |
| 7 | `api/poam/[id]/route.ts` | PUT, DELETE |
| 8 | `api/artifacts/route.ts` | GET, POST |
| 9 | `api/artifacts/[id]/route.ts` | DELETE |
| 10 | `api/report/route.ts` | GET ?level=1\|2\|all |
| 11 | `api/report/export/route.ts` | GET (CSV) |
| 12 | `api/settings/reset/route.ts` | DELETE |

### Phase 2-5: Server Actions 생성

| 순서 | 파일 | Actions |
|:---|:---|:---|
| 1 | `actions/evaluations.ts` | saveEvaluation |
| 2 | `actions/poam.ts` | createPoam, updatePoam, deletePoam |
| 3 | `actions/artifacts.ts` | createArtifact, deleteArtifact |
| 4 | `actions/settings.ts` | resetEvaluationData |

---

## 7. 비즈니스 규칙 구현 위치

| 규칙 | 구현 위치 | 설명 |
|:---|:---|:---|
| SPRS 계산 `110 - SUM(NOT MET weights)` | RSC 쿼리 + `api/sprs` | Drizzle aggregate 쿼리 |
| Level 1 POA&M 불가 | `actions/poam.ts` + UI 비활성화 | 서버에서 검증, 클라이언트에서 버튼 숨김 |
| weight=5 POA&M 불가 | `actions/poam.ts` + UI 경고 | 서버에서 검증, 클라이언트에서 경고 표시 |
| `/settings` admin only | `middleware.ts` (이미 구현) | role 검사 후 `/dashboard` 리다이렉트 |
| 평가 UPSERT | `actions/evaluations.ts` | `onConflictDoUpdate({ target: itemId })` |
| status=completed → completedAt 자동 기록 | `actions/poam.ts` | Server Action에서 처리 |

---

## 8. 파일 구조 (Phase 2 완료 목표)

```
src/
├── app/
│   ├── (auth)/login/page.tsx              ✅
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── assessment/level1/page.tsx
│   │   ├── assessment/level2/page.tsx
│   │   ├── gap-analysis/page.tsx
│   │   ├── poam/page.tsx
│   │   ├── poam/new/page.tsx
│   │   ├── poam/[id]/edit/page.tsx
│   │   ├── artifacts/page.tsx
│   │   ├── sprs/page.tsx
│   │   ├── report/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts    ✅
│       ├── checklist/route.ts
│       ├── evaluations/route.ts
│       ├── gap-analysis/route.ts
│       ├── sprs/route.ts
│       ├── dashboard/route.ts
│       ├── poam/route.ts
│       ├── poam/[id]/route.ts
│       ├── artifacts/route.ts
│       ├── artifacts/[id]/route.ts
│       ├── report/route.ts
│       ├── report/export/route.ts
│       └── settings/reset/route.ts
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx                    ✅
│   │   └── Header.tsx                     ✅
│   ├── assessment/
│   │   └── EvaluationForm.tsx
│   ├── dashboard/
│   │   └── DomainChart.tsx
│   ├── artifacts/
│   │   └── ArtifactModal.tsx
│   ├── report/
│   │   └── LevelRadio.tsx
│   └── ui/
│       ├── WeightBadge.tsx
│       ├── StatusBadge.tsx
│       └── ConfirmDialog.tsx
├── actions/
│   ├── evaluations.ts
│   ├── poam.ts
│   ├── artifacts.ts
│   └── settings.ts
├── types/
│   └── index.ts
├── db/                                    ✅
├── lib/                                   ✅
└── middleware.ts                          ✅
```

---

## 문서 버전 이력

| 버전 | 일자 | 변경 내용 |
|:---|:---|:---|
| v0.1 | 2026-05-23 | 최초 작성 |
