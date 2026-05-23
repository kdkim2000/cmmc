# SKILL.md — AI-DLC 스킬 진행 현황 및 사용 가이드

## 스킬 진행 현황

| 단계 | 스킬 명령어 | 역할 | 산출물 | 상태 |
|:---|:---|:---|:---|:---:|
| **Phase 0** | `/ai-dlc-requirements` | 요구사항 정의서 작성 | `요구사항정의서_CMMC_인증관리시스템_20260523.md` | ✅ 완료 |
| **Phase 1-1** | `/ai-dlc-usecase-create` | 유즈케이스 시나리오 생성 | `설계산출물/유즈케이스_CMMC_인증관리시스템_20260523.md` | ✅ 완료 |
| **Phase 1-2** | `/ai-dlc-screen-list` | 화면 목록 도출 | `설계산출물/화면목록_CMMC_인증관리시스템_20260523.md` | ✅ 완료 |
| **Phase 1-3** | `/ai-dlc-data-design` | 데이터 모델 설계 | `설계산출물/데이터설계서_CMMC_인증관리시스템_20260523.md` | ✅ 완료 |
| **Phase 1-4** | `/ai-dlc-api-design` | API 명세 설계 | `설계산출물/API설계서_CMMC_인증관리시스템_20260523.yaml` | ✅ 완료 |
| **Phase 1-5** | `/ai-dlc-screen-spec` | 화면 상세 정의 | `설계산출물/화면정의서_CMMC_인증관리시스템_20260523.md` | ✅ 완료 |
| **Phase 2-1** | `/ai-dlc-nxt-project-setup` | Next.js 15 프로젝트 초기화 | `package.json`, `src/` 구조 | ⏳ 대기 |
| **Phase 2-2** | `/ai-dlc-nxt-impl-plan` | 구현 전략 수립 | `설계산출물/Next.js구현계획_YYYYMMDD.md` | ⏳ 대기 |
| **Phase 2-3** | `/ai-dlc-nxt-page-gen` | 페이지 컴포넌트 생성 | `src/app/**/*.tsx` | ⏳ 대기 |
| **Phase 2-4** | `/ai-dlc-nxt-route-handler-gen` | API Route Handler 생성 | `src/app/api/**/*.ts` | ⏳ 대기 |
| **Phase 2-5** | `/ai-dlc-nxt-server-action-gen` | Server Action 생성 | `src/actions/**/*.ts` | ⏳ 대기 |
| **Phase 3-1** | `/ai-dlc-nxt-code-review` | 코드 품질 리뷰 | 리뷰 리포트 | ⏳ 대기 |
| **Phase 3-2** | `/ai-dlc-nxt-deploy-guide` | Vercel 배포 가이드 | 배포 설정 완료 | ⏳ 대기 |

> **범례**: ✅ 완료 · 🔄 진행중 · ⏳ 대기 · ❌ 차단됨

---

## 스킬별 상세 가이드

### Phase 0: 요구사항 정의 ✅

```bash
/ai-dlc-requirements
```
- **입력**: 사업 설명 자연어 텍스트, `docs/cmmc-level1.md`, `docs/cmmc-level2.md`
- **산출물**: `요구사항정의서_{사업명}_{YYYYMMDD}.md`
- **완료 조건**: FR·PR·SR·QR·IR·DR·CR 분류 전체 작성

---

### Phase 1-1: 유즈케이스 생성 ✅

```bash
/ai-dlc-usecase-create @요구사항정의서_CMMC_인증관리시스템_20260523.md 파일을 기반으로 유즈케이스를 작성하라.
```
- **입력**: 요구사항 정의서
- **산출물**: `설계산출물/유즈케이스_CMMC_인증관리시스템_20260523.md`
- **주요 결과**: UC-001~UC-010 (10개), FR 커버리지 100%

---

### Phase 1-2: 화면 목록

```bash
/ai-dlc-screen-list @설계산출물/유즈케이스_CMMC_인증관리시스템_20260523.md 파일을 기반으로 화면 목록을 작성하라.
```
- **입력**: 유즈케이스 문서
- **산출물**: `설계산출물/화면목록_CMMC_인증관리시스템_{YYYYMMDD}.md`
- **예상 화면**: 로그인(SCR-001), 대시보드(SCR-002), Level1 점검(SCR-003), Level2 점검(SCR-004), 갭분석(SCR-005), POA&M(SCR-006), 증적관리(SCR-007), SPRS(SCR-008), 리포트(SCR-009), 설정(SCR-010)

---

### Phase 1-3: 데이터 모델 설계

```bash
/ai-dlc-data-design @설계산출물/유즈케이스_CMMC_인증관리시스템_20260523.md 파일을 기반으로 데이터 모델을 설계하라. DB는 Neon Postgres(PostgreSQL)이며 Drizzle ORM을 사용한다.
```
- **입력**: 유즈케이스 문서
- **산출물**: `설계산출물/데이터설계서_CMMC_인증관리시스템_{YYYYMMDD}.md`
- **주요 테이블**: `checklist_items`, `evaluations`, `poa_and_m`, `artifacts`, `users`

---

### Phase 1-4: API 설계

```bash
/ai-dlc-api-design @설계산출물/유즈케이스_CMMC_인증관리시스템_20260523.md @설계산출물/화면목록_CMMC_인증관리시스템_*.md 파일을 기반으로 Next.js Route Handler 기반 REST API를 설계하라.
```
- **입력**: 유즈케이스 + 화면 목록
- **산출물**: `설계산출물/API설계서_CMMC_인증관리시스템_{YYYYMMDD}.yaml`
- **주요 엔드포인트**:
  - `GET /api/checklist?level=1|2` — 점검항목 조회
  - `GET|POST|PUT /api/evaluations` — 평가 결과 CRUD
  - `GET /api/gap-analysis?level=1|2` — 갭 분석
  - `GET /api/sprs` — SPRS 점수
  - `GET|POST|PUT|DELETE /api/poam` — POA&M CRUD
  - `GET|POST|DELETE /api/artifacts` — 증적 CRUD

---

### Phase 1-5: 화면 상세 정의

```bash
/ai-dlc-screen-spec @설계산출물/화면목록_CMMC_인증관리시스템_*.md @설계산출물/API설계서_CMMC_인증관리시스템_*.yaml 파일을 기반으로 화면 정의서를 작성하라.
```
- **입력**: 화면 목록 + API 설계서
- **산출물**: `설계산출물/화면정의서_CMMC_인증관리시스템_{YYYYMMDD}.md`
- **내용**: SCR별 레이아웃, 입출력, 이벤트, API 연계, ASCII UI 목형

---

### Phase 2-1: Next.js 프로젝트 초기화

```bash
/ai-dlc-nxt-project-setup
```
- **사전 조건**: Vercel 프로젝트 생성 + Neon Postgres Storage 연동 완료 → `DATABASE_URL` 확보
- **설정 포함**: TypeScript strict, Tailwind CSS, shadcn/ui, NextAuth.js v5, Drizzle ORM

---

### Phase 2-2: 구현 계획 수립

```bash
/ai-dlc-nxt-impl-plan @설계산출물/화면정의서_CMMC_인증관리시스템_*.md @설계산출물/API설계서_CMMC_인증관리시스템_*.yaml
```
- **산출물**: App Router 라우트 구조, RSC/CC 분류 기준, 데이터 패칭 전략

---

### Phase 2-3~5: 코드 생성

각 스킬을 화면/도메인 단위로 반복 호출한다.

```bash
# 페이지 생성 (화면별)
/ai-dlc-nxt-page-gen SCR-002 대시보드 화면

# Route Handler 생성 (API별)
/ai-dlc-nxt-route-handler-gen evaluations 도메인

# Server Action 생성 (도메인별)
/ai-dlc-nxt-server-action-gen evaluations 평가결과 저장·수정
```

---

### Phase 3: 검증 및 배포

```bash
/ai-dlc-nxt-code-review    # 코드 품질 검토
/ai-dlc-nxt-deploy-guide   # Vercel 배포 절차 가이드
```
