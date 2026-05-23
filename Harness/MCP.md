# MCP.md — MCP 서버 연동 가이드

본 프로젝트에서 사용 가능한 MCP(Model Context Protocol) 서버와 각 서버의 용도 및 사용법을 정의한다.

---

## 사용 가능한 MCP 서버

### 1. Vercel MCP (`mcp__claude_ai_Vercel__`)

**용도**: Vercel 플랫폼 연동 — 프로젝트 배포, 환경변수 관리, 배포 상태 확인

| 도구 | 설명 | 사용 시점 |
|:---|:---|:---|
| `authenticate` | Vercel 계정 인증 | Phase 2-1 프로젝트 초기화 전 |
| `complete_authentication` | 인증 완료 처리 | 인증 흐름 중 |

**사용 시점**: Phase 2-1 (`/ai-dlc-nxt-project-setup`) 실행 전, Vercel 프로젝트 생성 및 Neon Postgres Storage 연동 시

**주의사항**:
- Vercel 인증은 1회만 수행하면 세션이 유지된다.
- Vercel 환경변수(`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)는 Vercel 대시보드에서 직접 등록하거나 MCP를 통해 설정한다.

---

### 2. IDE MCP (`mcp__ide__`)

**용도**: IDE 연동 — 코드 실행, 진단 정보 수집

| 도구 | 설명 | 사용 시점 |
|:---|:---|:---|
| `executeCode` | 코드 스니펫 실행 | DB 마이그레이션 스크립트 실행, 시드 데이터 삽입 |
| `getDiagnostics` | TypeScript 타입 오류·린트 진단 | Phase 2 코드 생성 후 품질 검사 |

**사용 시점**:
- Phase 2-1 이후 `npx drizzle-kit push` 실행 검증
- Phase 3-1 코드 리뷰 전 TypeScript 진단 수집
- 개발 서버 실행 후 오류 감지

**활용 예시**:
```
# TypeScript 오류 확인
mcp__ide__getDiagnostics → src/db/schema.ts 오류 수집

# 시드 스크립트 실행
mcp__ide__executeCode → npm run db:seed
```

---

### 3. Cloud MCP (`mcp__mcp-server-cloud__`)

**용도**: 개발 진행 통계 및 일일 리포트 관리

| 도구 | 설명 | 사용 시점 |
|:---|:---|:---|
| `get_my_stats` | 현재 작업 통계 조회 | 일일 작업 현황 확인 |
| `log_usage` | 작업 사용량 기록 | 주요 마일스톤 완료 시 |
| `submit_daily_report` | 일일 리포트 제출 | 하루 작업 종료 시 |

**사용 시점**: 각 Phase 완료 후 진행 상황 기록

---

## MCP 연동 체크리스트

### Phase 2 시작 전 (Vercel 환경 구성)

```
[ ] mcp__claude_ai_Vercel__authenticate 로 Vercel 계정 인증
[ ] Vercel 대시보드에서 신규 프로젝트 생성
[ ] Storage 탭 → Neon Postgres 생성 및 프로젝트 연결
[ ] DATABASE_URL 자동 주입 확인
[ ] NEXTAUTH_SECRET 환경변수 수동 등록 (openssl rand -base64 32)
[ ] NEXTAUTH_URL 환경변수 등록 (Vercel 도메인)
```

### Phase 2 코드 생성 후

```
[ ] mcp__ide__getDiagnostics 로 TypeScript 오류 없음 확인
[ ] mcp__ide__executeCode 로 npx drizzle-kit push 실행
[ ] mcp__ide__executeCode 로 npm run db:seed 실행
```

### Phase 3 배포 후

```
[ ] mcp__mcp-server-cloud__log_usage 로 배포 완료 기록
[ ] mcp__mcp-server-cloud__submit_daily_report 로 일일 리포트 제출
```

---

## 환경변수 목록

| 변수명 | 설명 | 설정 위치 | 필수 여부 |
|:---|:---|:---|:---:|
| `DATABASE_URL` | Neon Postgres 연결 문자열 | Vercel Storage 자동 주입 | 필수 |
| `NEXTAUTH_SECRET` | NextAuth.js 세션 서명 키 | Vercel 환경변수 수동 등록 | 필수 |
| `NEXTAUTH_URL` | 애플리케이션 기본 URL | Vercel 환경변수 수동 등록 | 필수 |
| `ADMIN_EMAIL` | 초기 관리자 이메일 | Vercel 환경변수 수동 등록 | 선택 |
| `ADMIN_PASSWORD` | 초기 관리자 패스워드 | Vercel 환경변수 수동 등록 | 선택 |

> **보안 주의**: 환경변수는 절대 소스코드에 하드코딩하지 않는다. `.env.local` 파일은 `.gitignore`에 포함되어야 한다.
