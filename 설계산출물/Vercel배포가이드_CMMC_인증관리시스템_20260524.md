# Vercel 배포 가이드 — CMMC 인증 관리 시스템

작성일: 2026-05-24

---

## 사전 준비

| 항목 | 내용 |
|:---|:---|
| Node.js | 20.x 이상 |
| GitHub 계정 | 소스 코드 저장소 |
| Vercel 계정 | vercel.com (GitHub 계정 연동) |
| Neon 계정 | neon.tech (PostgreSQL 서버리스 DB) |

---

## 1단계: Neon Postgres 데이터베이스 준비

### 1-1. Neon 프로젝트 생성

1. [neon.tech](https://neon.tech) 접속 → 로그인
2. **New Project** 클릭
3. 프로젝트명: `cmmc-compliance` 입력
4. Region: `AWS / ap-northeast-2 (Seoul)` 선택
5. **Create Project** 클릭

### 1-2. 연결 문자열 복사

- Dashboard → **Connection Details**
- **Connection string** 탭에서 `postgresql://...` 형식 문자열 복사
- 이 값이 `DATABASE_URL` 환경변수가 됨

---

## 2단계: GitHub 저장소 준비

```bash
# 로컬 프로젝트 초기화 (이미 완료된 경우 생략)
git init
git add .
git commit -m "init: CMMC compliance management system"

# GitHub 원격 저장소 연결
git remote add origin https://github.com/{YOUR_USERNAME}/cmmc.git
git push -u origin main
```

> **보안 주의**: `.env.local` 파일은 `.gitignore`에 포함되어 있어야 합니다. 절대 커밋하지 마세요.

---

## 3단계: Vercel 프로젝트 생성 및 배포

### 3-1. Vercel에서 프로젝트 가져오기

1. [vercel.com](https://vercel.com) → **Add New Project**
2. **Import Git Repository** → GitHub 저장소 선택
3. Framework Preset: `Next.js` (자동 감지)
4. Root Directory: `/` (기본값)
5. **Environment Variables** 섹션으로 이동 (배포 전 반드시 설정)

### 3-2. 환경변수 설정

아래 변수를 Vercel Dashboard → **Settings > Environment Variables**에서 모두 추가:

| 변수명 | 값 | 환경 |
|:---|:---|:---|
| `DATABASE_URL` | Neon 연결 문자열 | Production, Preview, Development |
| `NEXTAUTH_SECRET` | 랜덤 32자 이상 문자열 | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production |
| `ADMIN_EMAIL` | 관리자 계정 이메일 | Production, Preview, Development |
| `ADMIN_PASSWORD` | 관리자 계정 비밀번호 (8자 이상) | Production, Preview, Development |

#### NEXTAUTH_SECRET 생성 방법

```bash
# OpenSSL 사용 (터미널)
openssl rand -base64 32

# 또는 Node.js 사용
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3-3. 배포 실행

- 환경변수 설정 완료 후 **Deploy** 클릭
- 빌드 로그 확인: `next build` 성공 여부 확인
- 배포 URL 확인: `https://cmmc-xxxxx.vercel.app`

---

## 4단계: 데이터베이스 스키마 + 시드 데이터 적용

### 4-1. 로컬에서 원격 DB에 스키마 반영

```bash
# .env.local의 DATABASE_URL이 Neon 연결 문자열인지 확인
cat .env.local

# Drizzle 스키마 → Neon DB 반영
npm run db:push
```

### 4-2. 시드 데이터 삽입

```bash
# Level 1 (15개) + Level 2 (110개) 점검항목 + 관리자 계정 삽입
npm run db:seed
```

> 시드 스크립트는 관리자 계정을 `.env.local`의 `ADMIN_EMAIL` / `ADMIN_PASSWORD`로 생성합니다.

---

## 5단계: 배포 검증

### 5-1. 기능 점검 체크리스트

- [ ] `/login` 페이지 정상 로딩
- [ ] 관리자 계정으로 로그인 성공
- [ ] `/dashboard` 대시보드 차트 표시 (DB 연결 확인)
- [ ] `/assessment/level1` — Level 1 점검항목 15개 표시
- [ ] `/assessment/level2` — Level 2 점검항목 110개 표시
- [ ] 평가 결과(MET/NOT MET) 저장 및 실시간 반영
- [ ] `/gap-analysis` — NOT MET 항목 필터링
- [ ] `/poam/new` — POA&M 등록 (Level 2, weight≠5 항목만)
- [ ] `/sprs` — SPRS 점수 계산 표시
- [ ] `/report?level=2` — CSV 내보내기 다운로드
- [ ] `/settings` — 관리자 전용 접근 (일반 계정 접근 차단 확인)

---

## 6단계: 커스텀 도메인 연결 (선택)

1. Vercel Dashboard → **Settings > Domains**
2. **Add Domain** → 도메인 입력 (예: `cmmc.yourdomain.com`)
3. DNS 설정: CNAME 레코드 → `cname.vercel-dns.com`
4. `NEXTAUTH_URL` 환경변수를 커스텀 도메인으로 업데이트

---

## 자동 배포 흐름

GitHub 연동 시 아래 흐름으로 자동 배포된다:

```
git push origin main
       ↓
  Vercel CI 트리거
       ↓
  npm run build (Next.js)
       ↓
  배포 완료 → Production URL 갱신
```

PR 생성 시 Preview 환경에 자동 배포된다.

---

## 문제 해결

| 증상 | 원인 | 해결 |
|:---|:---|:---|
| 빌드 실패 — TypeScript 오류 | 코드 타입 오류 | `npm run build` 로컬 실행 후 오류 수정 |
| 로그인 후 500 오류 | `DATABASE_URL` 미설정 | Vercel 환경변수 확인 |
| 점검항목 0개 표시 | 시드 미실행 | `npm run db:seed` 재실행 |
| `/settings` 500 | `NEXTAUTH_SECRET` 미설정 | Vercel 환경변수에 추가 |
| CSV 한글 깨짐 | BOM 처리 | Excel에서 "데이터 > 텍스트/CSV 가져오기" 사용 |

---

## 로컬 개발 환경 설정

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 파일 생성
cp .env.example .env.local
# .env.local 편집: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, ADMIN_EMAIL, ADMIN_PASSWORD

# 3. DB 스키마 반영
npm run db:push

# 4. 시드 데이터 삽입
npm run db:seed

# 5. 개발 서버 실행 (Turbopack)
npm run dev
# → http://localhost:3000
```
