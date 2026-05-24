# 변경 이력 (Change Log)

AI-DLC 프로세스 기반 변경 요청(CR) 추적 테이블.  
새 변경 발생 시 CR-NNN을 채번하고 아래 테이블에 등록한다.

---

## CR 목록

| CR-NNN | 유형 | 제목 | 관련 FR | 영향 산출물 | 상태 | 등록일 | 완료일 |
|:---|:---|:---|:---|:---|:---|:---|:---|
| CR-001 | CR-BUG→CR-DB | Level 2 점검항목 가중치 오류 수정 | FR-005 | 데이터설계서 v0.2, seed.ts, utils.ts | ✅ 완료 | 2026-05-24 | 2026-05-24 |
| CR-002 | CR-INF | Vercel 배포 프레임워크 감지 오류 수정 | - | vercel.json (신규) | ✅ 완료 | 2026-05-24 | 2026-05-24 |
| CR-003 | CR-INF | NextAuth trustHost 설정 추가 (Vercel localhost 리다이렉트) | - | src/lib/auth.ts | ✅ 완료 | 2026-05-24 | 2026-05-24 |

---

## CR 상세

### CR-001 — Level 2 점검항목 가중치 오류 수정

**유형**: CR-BUG (초기) → CR-DB + CR-BIZ (재분류)  
**등록일**: 2026-05-24 | **완료일**: 2026-05-24  
**담당**: kdkim2000

**변경 원인**  
NIST SP 800-171 기준 Level 2 가중치 합계가 313으로 잘못 입력되어 SPRS 최저점이 -203으로 표시됨.  
권위 있는 참조 데이터(`docs/cmmc-level2-weight.json`) 확인 결과 실제 합계는 218, SPRS 최저점은 -108.

**오류 항목**

| 요구사항 ID | 변경 전 | 변경 후 |
|:---|:---|:---|
| 3.1.3 | weight=5 | weight=3 |
| 3.1.4 | weight=3 | weight=1 |
| 3.1.6 | weight=3 | weight=1 |

**실행 스킬 체인**
1. `/ai-dlc-impact-analysis` → 영향 파일 확정
2. 데이터설계서 수동 수정 → v0.2
3. 코드 반영:
   - `src/db/seed.ts` — DELETE + re-INSERT 전략으로 가중치 수정
   - `src/lib/utils.ts` — `sprsToPercent()` min -203 → -108
   - `src/app/(main)/sprs/page.tsx` — 범위 표시 텍스트
   - `src/lib/utils.test.ts` — 테스트 케이스 3개 값 수정
   - `src/lib/cmmc.test.ts` — 최저점 테스트 수정
4. `/ai-dlc-nxt-code-review` → 테스트 20개 전체 통과

**git 커밋**: `d9c2cf0 fix: correct Level 2 checklist weights per NIST SP 800-171 authoritative data`

---

### CR-002 — Vercel 배포 프레임워크 감지 오류 수정

**유형**: CR-INF  
**등록일**: 2026-05-24 | **완료일**: 2026-05-24

**변경 원인**  
Vercel이 프레임워크를 "Other"로 감지하여 `public` 디렉터리를 찾으려 함.  
Next.js 빌드 출력은 `.next`이므로 `vercel.json`으로 프레임워크를 명시.

**변경 파일**
- `vercel.json` (신규 생성)

**git 커밋**: `8329eb6 fix: add vercel.json to resolve Next.js framework detection failure`

---

### CR-003 — NextAuth trustHost 설정 추가

**유형**: CR-INF  
**등록일**: 2026-05-24 | **완료일**: 2026-05-24

**변경 원인**  
Vercel 배포 후 로그인 시 `localhost:3000`으로 리다이렉트됨.  
Auth.js v5가 Vercel 프록시의 `x-forwarded-host` 헤더를 신뢰하지 않아 `NEXTAUTH_URL`(localhost:3000)로 폴백.

**변경 파일**
- `src/lib/auth.ts` — `trustHost: true` 추가
- `.env.example` — Vercel 배포 시 `NEXTAUTH_URL` 주의사항 명시

**git 커밋**: `d402ae6 fix: add trustHost to NextAuth to resolve localhost redirect on Vercel`

---

## CR 등록 템플릿

새 변경 발생 시 아래 템플릿을 복사하여 CR 상세 섹션에 추가한다.

```markdown
### CR-NNN — [변경 제목]

**유형**: CR-[NEW|REQ|UI|API|DB|BIZ|BUG|INF]  
**등록일**: YYYY-MM-DD | **완료일**: -  
**담당**: [담당자]

**변경 원인**  
[변경이 필요한 이유를 2~3문장으로 설명]

**관련 FR**: FR-NNN (없으면 생략)

**실행 스킬 체인**
1. `/ai-dlc-impact-analysis` → ...
2. `/ai-dlc-xxx-revise` → ...
3. `/ai-dlc-xxx-validate` → ...
4. 코드 반영: ...
5. `/ai-dlc-nxt-code-review` → ...

**변경 파일**
- `파일경로` — 변경 내용

**git 커밋**: `커밋해시 커밋메시지`
```
