# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**CMMC Compliance Management System** — CMMC Level 1/2 인증 준비를 위한 AS-IS 점검·갭 분석·POA&M 추적 관리 웹 애플리케이션.

## Tech Stack

| Category | Tech | Notes |
|:---|:---|:---|
| Framework | Next.js 15 (App Router) | RSC 기본, `'use client'` 명시적 사용 |
| Language | TypeScript 5 (strict) | |
| Styling | Tailwind CSS 3 + shadcn/ui | CSS 변수 기반 테마 |
| Auth | NextAuth.js v5 (Credentials) | email + password, JWT session |
| ORM | Drizzle ORM | neon-http driver |
| DB | Neon Postgres (Vercel Storage) | `DATABASE_URL` 환경변수 |
| Charts | Recharts 2 | 대시보드 도메인별 바 차트 |
| Forms | React Hook Form + Zod | |

## Commands

```bash
npm run dev          # 개발 서버 (Turbopack)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 검사
npm run db:push      # Drizzle 스키마 → DB 반영
npm run db:studio    # Drizzle Studio
npm run db:seed      # 초기 마스터 데이터 + 관리자 계정 삽입
```

## Directory Structure

```
src/
├── app/
│   ├── (auth)/login/       # SCR-001 로그인 (인증 없음)
│   ├── (main)/             # 인증 필요 + 사이드바 레이아웃
│   │   ├── dashboard/      # SCR-002
│   │   ├── assessment/     # SCR-003, SCR-004
│   │   ├── gap-analysis/   # SCR-005
│   │   ├── poam/           # SCR-006, SCR-007
│   │   ├── artifacts/      # SCR-008
│   │   ├── sprs/           # SCR-009
│   │   ├── report/         # SCR-010
│   │   └── settings/       # SCR-011 (admin only)
│   └── api/                # Route Handlers
├── components/
│   ├── layout/             # Sidebar, Header
│   └── ui/                 # shadcn/ui 컴포넌트
├── db/
│   ├── schema.ts           # Drizzle 스키마
│   ├── index.ts            # DB 연결
│   └── seed.ts             # 시드 스크립트
├── lib/
│   ├── auth.ts             # NextAuth.js 설정
│   └── utils.ts            # cn(), formatDate() 등
├── types/
│   ├── index.ts            # 공유 타입
│   └── next-auth.d.ts      # Session 타입 확장
├── actions/                # Server Actions (Phase 2-5)
└── middleware.ts           # 인증 + 역할 기반 접근 제어
```

## Architecture Rules

- **RSC 기본**: Client Component는 `'use client'` 명시. 불필요한 CC 선언 금지.
- **DB 접근**: Server Component, Server Action, Route Handler에서만. Client Component에서 직접 DB 쿼리 금지.
- **인증**: `auth()` (RSC/Server Action), `useSession()` (CC)
- **뮤테이션**: 폼 제출은 Server Action (`src/actions/`). 외부 클라이언트 필요 시 Route Handler.
- **환경변수**: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — `.env.local` 필수. 절대 커밋 금지.

## Key Business Rules

- **SPRS 점수**: Level 2 전용. `110 - SUM(NOT MET 항목 weight)` (-203~110)
- **가중치 5점 항목**: NOT MET 시 POA&M 등록 불가 (즉시 시정 필요)
- **Level 1 항목**: POA&M 등록 불가
- **evaluations 테이블**: UNIQUE(item_id) — 항목당 1개, 재평가 시 UPSERT
- **/settings 경로**: `admin` 역할만 접근. middleware.ts에서 역할 검증.

## Post-Setup Steps (shadcn/ui)

```bash
npx shadcn@latest init
npx shadcn@latest add button input label card badge progress
npx shadcn@latest add accordion dialog alert-dialog select
npx shadcn@latest add toast tabs radio-group separator
```
