# AGENT.md — CMMC 인증관리시스템 AI 에이전트 지침

## 에이전트 역할

본 프로젝트의 Claude Code 에이전트는 **AI-DLC(AI-Driven Development Lifecycle) 방법론**을 따르는 **풀스택 개발 에이전트**로 동작한다.  
CMMC 인증 준비 관리 시스템(CMMC Compliance Management System)을 3일 내에 시안으로 완성하는 것이 목표다.

---

## 프로젝트 컨텍스트

| 항목 | 내용 |
|:---|:---|
| 사업명 | CMMC 인증 준비 관리 시스템 |
| 기간 | 2026-05-23 ~ 2026-05-25 (3일) |
| 스택 | Next.js 15 + Neon Postgres + Drizzle ORM + Vercel |
| 방법론 | AI-DLC (`/ai-dlc-*` 스킬 순차 활용) |
| 참조 문서 | `../요구사항정의서_CMMC_인증관리시스템_20260523.md` |
| 유즈케이스 | `../설계산출물/유즈케이스_CMMC_인증관리시스템_20260523.md` |

---

## 개발 단계별 역할 및 행동 원칙

### Phase 1 — 설계 단계

- 각 설계 스킬(`/ai-dlc-usecase-create`, `/ai-dlc-screen-list` 등)을 **순서대로** 호출한다.
- 이전 단계 산출물을 다음 단계의 입력으로 사용한다.
- 산출물은 반드시 `../설계산출물/` 폴더에 저장한다.
- 설계 산출물에 누락된 정보는 `<!-- TODO: 확인 필요 -->` 주석으로 표시한다.

### Phase 2 — 개발 단계

- `/ai-dlc-nxt-project-setup` 실행 전 반드시 `DATABASE_URL` 환경변수 확보 여부를 확인한다.
- 코드 생성은 **화면정의서(SCR-NNN)** 및 **API설계서**를 근거로 수행한다.
- 생성된 코드는 TypeScript strict 모드를 준수하고, `any` 타입 사용을 금지한다.
- Server Actions은 `'use server'` 지시어를 파일 최상단에 명시한다.
- 모든 폼 유효성 검사는 **Zod** 스키마를 사용한다.

### Phase 3 — 검증 및 배포

- `/ai-dlc-nxt-code-review` 완료 후 `/ai-dlc-nxt-deploy-guide`를 실행한다.
- 환경변수(`DATABASE_URL`, `NEXTAUTH_SECRET`)가 Vercel 프로젝트에 등록되었는지 확인한다.
- Vercel 배포 URL을 확인하고 주요 기능(로그인, 점검, 대시보드)의 정상 동작을 검증한다.

---

## 핵심 행동 원칙

### 해야 할 것 (DO)
- 항상 **AI-DLC 스킬을 먼저** 호출하고, 스킬 산출물을 기반으로 코드를 작성한다.
- 작업 전 `SKILL.md`의 진행 상태를 확인하여 중복 작업을 방지한다.
- 복잡한 작업은 `TaskCreate`로 단계를 분리하여 추적한다.
- CMMC 도메인 지식(`../docs/cmmc-level1.md`, `../docs/cmmc-level2.md`)을 참조하여 점검항목 데이터 정확성을 보장한다.
- 보안 관련 코드(인증, 접근통제)는 반드시 서버 사이드에서 처리한다.

### 하지 말 것 (DON'T)
- 설계 산출물 없이 코드를 직접 작성하지 않는다.
- 클라이언트 컴포넌트에서 DB를 직접 호출하지 않는다 (Server Actions / Route Handlers 경유).
- `console.log`를 프로덕션 코드에 남기지 않는다.
- 하드코딩된 자격증명, API 키를 소스코드에 포함하지 않는다.
- Vercel 배포 없이 Phase 3 완료로 간주하지 않는다.

---

## 파일 경로 규칙

| 유형 | 경로 |
|:---|:---|
| 설계 산출물 | `../설계산출물/*.md` |
| 참조 문서 | `../docs/*.md` |
| Next.js 소스 | `../src/**` |
| DB 스키마 | `../src/db/schema.ts` |
| Server Actions | `../src/actions/**/*.ts` |
| API Routes | `../src/app/api/**/*.ts` |
| Harness 문서 | `./` (현재 폴더) |

---

## 에이전트 작업 시작 체크리스트

```
[ ] SKILL.md에서 현재 단계 확인
[ ] 이전 단계 산출물 존재 확인
[ ] 해당 /ai-dlc-* 스킬 호출
[ ] 산출물 ../설계산출물/ 저장 확인
[ ] 다음 단계로 진행
```
