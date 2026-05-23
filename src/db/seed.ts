/**
 * DB 시드 스크립트
 * 실행: npm run db:seed
 *
 * 데이터 구조 원칙:
 *   - Level 1 (FAR 52.204-21): 요구사항 1개 = 1행, requirementId 고유 (15개)
 *   - Level 2 (NIST SP 800-171): 요구사항 1개 = 1행, requirementId 고유 (110개)
 *   두 레벨 모두 "요구사항 단위 평가(MET/NOT MET)" 구조로 일관성 확보
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import { checklistItems, users } from './schema'
import bcrypt from 'bcryptjs'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

// ============================================================
// Level 1 점검항목 (FAR 52.204-21) — 15개 기본 보안 요구사항
// requirementId: FAR 표준 식별자 (고유, 15개 모두 상이)
// weight: null (바이너리 판정 — SPRS 감점 없음)
// ============================================================
const LEVEL1_ITEMS = [
  // 1. 접근 통제 (AC) — 4개
  {
    level: '1' as const,
    domainCode: 'AC',
    domainName: '접근 통제',
    requirementId: 'AC.L1-b.1.i',
    requirement: '시스템 접근을 인가된 사용자, 인가된 프로세스 및 장치로 제한한다.',
    objective: '인가된 사용자·프로세스·기기가 식별되어 있고, 시스템 접근이 해당 인가 대상으로만 제한되는지 확인한다. (증적: ACL, AD 캡처, 접근 제어 목록)',
    weight: null,
    sortOrder: 1,
  },
  {
    level: '1' as const,
    domainCode: 'AC',
    domainName: '접근 통제',
    requirementId: 'AC.L1-b.1.ii',
    requirement: '인가된 사용자가 수행할 수 있는 트랜잭션 및 기능 유형을 제한한다.',
    objective: '인가된 사용자의 허용 기능·트랜잭션 유형이 정의되어 있고, 시스템이 최소 권한(Least Privilege) 원칙에 따라 이를 강제하는지 확인한다. (증적: 권한 부여 매트릭스, 설정 캡처)',
    weight: null,
    sortOrder: 2,
  },
  {
    level: '1' as const,
    domainCode: 'AC',
    domainName: '접근 통제',
    requirementId: 'AC.L1-b.1.iii',
    requirement: '외부 정보 시스템의 연결 및 사용을 검증하고 제어한다.',
    objective: '외부 시스템 연결이 식별·검증되고 제한되어 있으며, 외부 시스템 사용이 인가 범위 내로 통제되는지 확인한다. (증적: 방화벽 정책, VPN 접속 로그)',
    weight: null,
    sortOrder: 3,
  },
  {
    level: '1' as const,
    domainCode: 'AC',
    domainName: '접근 통제',
    requirementId: 'AC.L1-b.1.iv',
    requirement: '공개적으로 접근 가능한 시스템에 게시되거나 처리되는 정보를 통제한다.',
    objective: '공개 시스템 정보 게시 인가자가 지정되어 있고, FCI 미포함 검토 절차 및 FCI 발견 시 즉시 삭제 메커니즘이 운영되는지 확인한다. (증적: 정보 게시 승인 이력)',
    weight: null,
    sortOrder: 4,
  },

  // 2. 식별 및 인증 (IA) — 2개
  {
    level: '1' as const,
    domainCode: 'IA',
    domainName: '식별 및 인증',
    requirementId: 'IA.L1-b.1.v',
    requirement: '정보 시스템 사용자, 프로세스 및 장치를 식별한다.',
    objective: '시스템 사용자, 사용자를 대신해 작동하는 프로세스, 접근 기기에 고유 식별자가 할당되어 있는지 확인한다. (증적: 계정 목록 스크린샷, 기기 등록 대장)',
    weight: null,
    sortOrder: 5,
  },
  {
    level: '1' as const,
    domainCode: 'IA',
    domainName: '식별 및 인증',
    requirementId: 'IA.L1-b.1.vi',
    requirement: '접근 허가 이전에 사용자, 프로세스 및 장치의 신원을 인증(검증)한다.',
    objective: '사용자·프로세스·기기의 신원이 시스템 접근 허용 전에 비밀번호 등 인증 수단으로 검증되는지 확인한다. (증적: 인증 정책 설정 캡처, 로그인 로그)',
    weight: null,
    sortOrder: 6,
  },

  // 3. 매체 보호 (MP) — 1개
  {
    level: '1' as const,
    domainCode: 'MP',
    domainName: '매체 보호',
    requirementId: 'MP.L1-b.1.vii',
    requirement: '폐기 또는 재사용 전에 FCI가 포함된 시스템 매체를 파기하거나 삭제한다.',
    objective: 'FCI 포함 매체(USB, HDD, 종이 등)의 폐기 전 완전 삭제 또는 물리적 파기, 재사용 전 데이터 완전 삭제 여부를 확인한다. (증적: 매체 폐기 대장, 파쇄 기록)',
    weight: null,
    sortOrder: 7,
  },

  // 4. 물리적 보호 (PE) — 2개
  {
    level: '1' as const,
    domainCode: 'PE',
    domainName: '물리적 보호',
    requirementId: 'PE.L1-b.1.viii',
    requirement: '시스템, 장비 및 운영 환경에 대한 물리적 접근을 인가된 개인으로 제한한다.',
    objective: '물리적 접근 인가자 목록이 유지되고, 서버실 등 통제 구역의 물리적 접근이 인가자로 제한되는지 확인한다. (증적: 출입 인가자 명단, 카드키 시스템 내역)',
    weight: null,
    sortOrder: 8,
  },
  {
    level: '1' as const,
    domainCode: 'PE',
    domainName: '물리적 보호',
    requirementId: 'PE.L1-b.1.ix',
    requirement: '방문자를 에스코트하고 활동을 모니터링하며, 물리적 접근 감사 로그를 유지하고 접근 장치를 통제·관리한다.',
    objective: '외부 방문자 에스코트 및 활동 모니터링, 물리적 접근 감사 로그 기록·보관(3가지 NIST 실습: 3.10.3/3.10.4/3.10.5), 열쇠·카드 등 접근 장치의 발급·회수 관리 여부를 확인한다. (증적: 방문객 출입 대장, 전자 출입 로그, 카드 발급·반납 대장)',
    weight: null,
    sortOrder: 9,
  },

  // 5. 시스템 및 통신 보호 (SC) — 2개
  {
    level: '1' as const,
    domainCode: 'SC',
    domainName: '시스템 및 통신 보호',
    requirementId: 'SC.L1-b.1.x',
    requirement: '외부 경계 및 주요 내부 경계에서 조직의 통신을 모니터링·제어·보호한다.',
    objective: '외부 및 주요 내부 시스템 경계가 정의되어 있고, 해당 경계에서 인바운드·아웃바운드 통신이 방화벽 등을 통해 모니터링·제어·보호되는지 확인한다. (증적: 네트워크 다이어그램, 방화벽 룰셋)',
    weight: null,
    sortOrder: 10,
  },
  {
    level: '1' as const,
    domainCode: 'SC',
    domainName: '시스템 및 통신 보호',
    requirementId: 'SC.L1-b.1.xi',
    requirement: '내부 네트워크와 공개 접근 가능한 시스템 컴포넌트를 물리적·논리적으로 분리한다.',
    objective: '공개 접근 가능한 시스템(웹서버, DMZ 등)이 식별되어 있고, VLAN 또는 물리적 분리를 통해 내부 업무망과 격리되어 있는지 확인한다. (증적: 네트워크 토폴로지, VLAN 설정)',
    weight: null,
    sortOrder: 11,
  },

  // 6. 시스템 및 정보 무결성 (SI) — 4개
  {
    level: '1' as const,
    domainCode: 'SI',
    domainName: '시스템 및 정보 무결성',
    requirementId: 'SI.L1-b.1.xii',
    requirement: '시스템 결함을 식별하고 보고하며 적시에 수정한다.',
    objective: '시스템 취약점·결함이 식별·보고되고, 보안 패치가 적시에 적용되는지 확인한다. (증적: 패치 관리 이력, 취약점 스캔 보고서)',
    weight: null,
    sortOrder: 12,
  },
  {
    level: '1' as const,
    domainCode: 'SI',
    domainName: '시스템 및 정보 무결성',
    requirementId: 'SI.L1-b.1.xiii',
    requirement: '정보 시스템 내 적절한 위치에 악성 코드 보호 기능을 제공한다.',
    objective: '전사 PC·서버에 백신(Anti-virus) 등 악성코드 보호 기능이 배포·활성화되어 운영되는지 확인한다. (증적: 백신 배포 화면, 엔드포인트 보호 활성 캡처)',
    weight: null,
    sortOrder: 13,
  },
  {
    level: '1' as const,
    domainCode: 'SI',
    domainName: '시스템 및 정보 무결성',
    requirementId: 'SI.L1-b.1.xiv',
    requirement: '새로운 릴리스 사용 가능 시 악성 코드 보호 메커니즘을 업데이트한다.',
    objective: '악성코드 보호 메커니즘(백신 패턴·엔진)이 새 릴리스 출시 시 최신 상태로 자동 업데이트되는지 확인한다. (증적: 백신 중앙관리 콘솔 최신 업데이트 기록)',
    weight: null,
    sortOrder: 14,
  },
  {
    level: '1' as const,
    domainCode: 'SI',
    domainName: '시스템 및 정보 무결성',
    requirementId: 'SI.L1-b.1.xv',
    requirement: '파일 다운로드·열기·실행 시 외부 소스 파일을 실시간 스캔하고 주기적으로 시스템을 스캔한다.',
    objective: '외부 소스 파일에 대한 실시간 감시(Real-time scan) 기능이 활성화되어 있고, 주기적 전체 검사가 설정·수행되는지 확인한다. (증적: 안티바이러스 실시간 감시 ON 캡처, 정기 스캔 이력)',
    weight: null,
    sortOrder: 15,
  },
]

// ============================================================
// Level 2 점검항목 (NIST SP 800-171) — 110개 요구사항
// requirementId: NIST 표준 식별자 (고유, 3.X.Y 형식)
// weight: 1/3/5 (SPRS 점수 산정 기준)
// ============================================================
const LEVEL2_ITEMS = [
  // 1. 접근 통제 (AC) — 22개
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.1',  requirement: '시스템 접근을 인가된 사용자, 프로세스, 장치로 제한한다.', objective: '인가된 사용자·프로세스·장치 리스트와 실제 시스템 접근 로그가 일치하는지 확인한다.', weight: 1, sortOrder: 1 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.2',  requirement: '인가된 사용자가 실행할 수 있는 트랜잭션 및 기능 유형을 제한한다.', objective: '사용자 권한 설정이 직무별 최소 권한 원칙에 따라 트랜잭션 및 기능을 제한하고 있는지 확인한다.', weight: 1, sortOrder: 2 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.3',  requirement: 'CUI 흐름을 시스템 내·외부로 통제한다.', objective: 'CUI 데이터가 인가되지 않은 경로(이메일, USB 등)로 흐르는지 모니터링하고 차단하는지 확인한다.', weight: 3, sortOrder: 3 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.4',  requirement: '직무 분리(Separation of Duties)를 통해 악의적 공모 위험을 줄인다.', objective: '시스템 관리·보안 감사 등 민감한 직무가 적절히 분리되어 있는지 확인한다.', weight: 1, sortOrder: 4 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.5',  requirement: '최소 권한(Least Privilege) 원칙을 적용한다.', objective: '사용자 및 프로세스가 작업 수행에 필요한 최소한의 권한만 가지고 있는지 확인한다.', weight: 3, sortOrder: 5 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.6',  requirement: '특권(관리자) 계정 사용을 최소화한다.', objective: '관리자 권한 계정 수가 최소화되어 있고, 일반 업무용으로 사용되지 않는지 확인한다.', weight: 1, sortOrder: 6 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.7',  requirement: '비권한 사용자가 보안 기능 및 정보를 실행하지 못하도록 방지한다.', objective: '사용자가 시스템 보안 설정을 임의로 변경하거나 접근하지 못하도록 설정되어 있는지 확인한다.', weight: 1, sortOrder: 7 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.8',  requirement: '실패한 로그인 시도 횟수를 제한한다.', objective: '일정 횟수 이상 로그인 실패 시 계정이 잠기거나 지연되는 정책이 적용되어 있는지 확인한다.', weight: 1, sortOrder: 8 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.9',  requirement: '시스템 접근 시 보안 공지문(배너)을 제공한다.', objective: '시스템 로그인 시 권한 없는 접근에 대한 경고문이 표시되는지 확인한다.', weight: 1, sortOrder: 9 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.10', requirement: '세션 잠금 기능을 적용한다.', objective: '일정 시간 조작이 없을 시 자동으로 화면이 잠기는지 확인한다.', weight: 1, sortOrder: 10 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.11', requirement: '비활성 세션을 자동 종료한다.', objective: '일정 시간 비활성 시 사용자 세션이 시스템적으로 종료되는지 확인한다.', weight: 1, sortOrder: 11 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.12', requirement: '원격 접속을 모니터링하고 제어한다.', objective: '원격 접속이 승인된 시스템을 통해서만 이루어지고, 접속 로그가 기록되는지 확인한다.', weight: 3, sortOrder: 12 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.13', requirement: '원격 접속 시 암호화된 세션을 사용한다.', objective: 'VPN 등 암호화된 터널을 통해 원격 접속이 이루어지는지 확인한다.', weight: 5, sortOrder: 13 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.14', requirement: '원격 접속을 관리되는 접근 제어 포인트를 통해 라우팅한다.', objective: '모든 원격 접속이 통제된 게이트웨이(방화벽 등)를 거치는지 확인한다.', weight: 3, sortOrder: 14 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.15', requirement: '원격 접속 시 명령어 실행을 통제한다.', objective: '원격 접속자가 시스템에서 실행 가능한 명령어를 제한하는 정책이 있는지 확인한다.', weight: 1, sortOrder: 15 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.16', requirement: '무선 접속을 인가하고 모니터링한다.', objective: '비인가 무선 AP가 설치되지 않았으며, 인가된 무선 접속만 허용하는지 확인한다.', weight: 1, sortOrder: 16 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.17', requirement: '무선 접속을 인증 및 암호화로 보호한다.', objective: '사용되는 무선 통신이 강력한 인증(WPA3 등)과 암호화로 보호되는지 확인한다.', weight: 3, sortOrder: 17 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.18', requirement: '모바일 기기 연결을 제어한다.', objective: '사내 업무용 모바일 기기의 시스템 연결이 정책에 의해 제어되는지 확인한다.', weight: 3, sortOrder: 18 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.19', requirement: '외부 시스템에 CUI 전송 시 암호화한다.', objective: 'CUI 데이터를 외부로 전송할 때 암호화되어 전송되는지 확인한다.', weight: 5, sortOrder: 19 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.20', requirement: '외부 시스템 연결을 모니터링 및 제한한다.', objective: '외부 시스템과 데이터를 교환할 때 보안 연결을 모니터링하는지 확인한다.', weight: 3, sortOrder: 20 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.21', requirement: '휴대용 저장 매체 사용을 제한한다.', objective: 'USB 등 외부 저장 매체 사용을 제한하거나 암호화된 기기만 허용하는지 확인한다.', weight: 3, sortOrder: 21 },
  { level: '2' as const, domainCode: 'AC', domainName: '접근 통제', requirementId: '3.1.22', requirement: '공개 시스템 내 CUI 게시를 통제한다.', objective: '공개 웹사이트 등에 CUI 데이터가 노출되지 않도록 게시 전 검토 절차가 존재하는지 확인한다.', weight: 3, sortOrder: 22 },

  // 2. 인식 및 교육 (AT) — 3개
  { level: '2' as const, domainCode: 'AT', domainName: '인식 및 교육', requirementId: '3.2.1', requirement: '보안 인식 교육을 정기적으로 실시한다.', objective: '전 직원이 매년 보안 인식 교육을 이수하고 기록이 남아있는지 확인한다.', weight: 1, sortOrder: 23 },
  { level: '2' as const, domainCode: 'AT', domainName: '인식 및 교육', requirementId: '3.2.2', requirement: '역할에 따른 전문 보안 교육을 실시한다.', objective: '관리자·개발자 등 특정 역할을 가진 직원이 직무에 맞는 보안 교육을 받는지 확인한다.', weight: 1, sortOrder: 24 },
  { level: '2' as const, domainCode: 'AT', domainName: '인식 및 교육', requirementId: '3.2.3', requirement: '내부자 위협 인식 교육을 실시한다.', objective: '내부자 위협을 인지하고 보고하는 방법에 대한 교육 콘텐츠가 있는지 확인한다.', weight: 1, sortOrder: 25 },

  // 3. 감사 및 책임 (AU) — 9개
  { level: '2' as const, domainCode: 'AU', domainName: '감사 및 책임', requirementId: '3.3.1', requirement: '시스템 감사 로그를 생성하고 기록한다.', objective: '시스템 로그인·계정 변경·데이터 접근 등 주요 이벤트가 로그로 기록되는지 확인한다.', weight: 3, sortOrder: 26 },
  { level: '2' as const, domainCode: 'AU', domainName: '감사 및 책임', requirementId: '3.3.2', requirement: '사용자 행위를 고유하게 추적 가능하게 한다.', objective: '시스템 로그에 사용자 식별 정보(ID)가 명시되어 있는지 확인한다.', weight: 3, sortOrder: 27 },
  { level: '2' as const, domainCode: 'AU', domainName: '감사 및 책임', requirementId: '3.3.3', requirement: '감사 기록을 정기적으로 검토한다.', objective: '주기적으로 로그를 검토하고 이상 징후를 식별한 흔적이 있는지 확인한다.', weight: 3, sortOrder: 28 },
  { level: '2' as const, domainCode: 'AU', domainName: '감사 및 책임', requirementId: '3.3.4', requirement: '로그 저장 실패 시 알림을 제공한다.', objective: '로그 저장소가 가득 차거나 시스템 오류 발생 시 관리자에게 알람이 가는지 확인한다.', weight: 1, sortOrder: 29 },
  { level: '2' as const, domainCode: 'AU', domainName: '감사 및 책임', requirementId: '3.3.5', requirement: '상관 분석을 통해 사고를 조사한다.', objective: '여러 시스템 로그를 종합 분석하여 보안 사고를 조사하는 절차가 있는지 확인한다.', weight: 1, sortOrder: 30 },
  { level: '2' as const, domainCode: 'AU', domainName: '감사 및 책임', requirementId: '3.3.6', requirement: '감사 도구를 제공한다.', objective: '로그를 효율적으로 수집·검색·리포팅할 수 있는 도구(SIEM 등)가 있는지 확인한다.', weight: 1, sortOrder: 31 },
  { level: '2' as const, domainCode: 'AU', domainName: '감사 및 책임', requirementId: '3.3.7', requirement: '시간 동기화를 보장한다.', objective: '네트워크 내 모든 시스템의 시간이 NTP 등을 통해 동기화되어 있는지 확인한다.', weight: 1, sortOrder: 32 },
  { level: '2' as const, domainCode: 'AU', domainName: '감사 및 책임', requirementId: '3.3.8', requirement: '감사 로그에 대한 접근 및 변경을 방지한다.', objective: '로그 수정·삭제 권한을 엄격히 제한하고 로그 무결성을 보장하는지 확인한다.', weight: 3, sortOrder: 33 },
  { level: '2' as const, domainCode: 'AU', domainName: '감사 및 책임', requirementId: '3.3.9', requirement: '비인가된 로그 접근을 방지한다.', objective: '로그 관리를 담당하지 않는 사용자나 프로세스의 접근이 제한되는지 확인한다.', weight: 1, sortOrder: 34 },

  // 4. 구성 관리 (CM) — 9개
  { level: '2' as const, domainCode: 'CM', domainName: '구성 관리', requirementId: '3.4.1', requirement: '구성 베이스라인을 수립한다.', objective: '시스템별 초기 구성 설정값(이미지)이 문서화되어 있는지 확인한다.', weight: 1, sortOrder: 35 },
  { level: '2' as const, domainCode: 'CM', domainName: '구성 관리', requirementId: '3.4.2', requirement: '안전한 보안 구성 설정을 강제한다.', objective: '불필요한 기능 제거·패스워드 정책 등 보안 설정이 강제되고 있는지 확인한다.', weight: 3, sortOrder: 36 },
  { level: '2' as const, domainCode: 'CM', domainName: '구성 관리', requirementId: '3.4.3', requirement: '변경 사항을 추적, 검토, 승인한다.', objective: '시스템 변경 시 변경 관리 절차(승인 문서 등)가 준수되고 있는지 확인한다.', weight: 1, sortOrder: 37 },
  { level: '2' as const, domainCode: 'CM', domainName: '구성 관리', requirementId: '3.4.4', requirement: '변경의 보안 영향을 분석한다.', objective: '변경 작업 전 보안 위험 분석 문서를 작성하는지 확인한다.', weight: 1, sortOrder: 38 },
  { level: '2' as const, domainCode: 'CM', domainName: '구성 관리', requirementId: '3.4.5', requirement: '최소 권한으로 구성한다.', objective: '관리자 계정의 시스템 변경 권한이 필요한 사람에게만 부여되는지 확인한다.', weight: 1, sortOrder: 39 },
  { level: '2' as const, domainCode: 'CM', domainName: '구성 관리', requirementId: '3.4.6', requirement: '최소 기능 원칙을 구현한다.', objective: '시스템에서 사용하지 않는 포트·서비스·프로토콜을 비활성화했는지 확인한다.', weight: 3, sortOrder: 40 },
  { level: '2' as const, domainCode: 'CM', domainName: '구성 관리', requirementId: '3.4.7', requirement: '비인가 소프트웨어 사용을 방지한다.', objective: '승인되지 않은 소프트웨어 설치를 차단하는지 확인한다.', weight: 1, sortOrder: 41 },
  { level: '2' as const, domainCode: 'CM', domainName: '구성 관리', requirementId: '3.4.8', requirement: '비승인 프로그램 실행을 차단한다.', objective: '화이트리스트·블랙리스트 등을 통해 비인가 프로그램 실행을 막는지 확인한다.', weight: 1, sortOrder: 42 },
  { level: '2' as const, domainCode: 'CM', domainName: '구성 관리', requirementId: '3.4.9', requirement: '사용자 설치 소프트웨어 승인을 통제한다.', objective: '사용자가 승인 없이 소프트웨어를 설치할 수 없도록 권한이 제한되어 있는지 확인한다.', weight: 1, sortOrder: 43 },

  // 5. 식별 및 인증 (IA) — 11개
  { level: '2' as const, domainCode: 'IA', domainName: '식별 및 인증', requirementId: '3.5.1',  requirement: '사용자, 프로세스, 기기를 식별한다.', objective: '모든 개체에 고유 식별자가 할당되어 있는지 확인한다.', weight: 3, sortOrder: 44 },
  { level: '2' as const, domainCode: 'IA', domainName: '식별 및 인증', requirementId: '3.5.2',  requirement: '접근 전 신원을 인증한다.', objective: '로그인 인증이 통과된 후에만 리소스 접근이 가능한지 확인한다.', weight: 3, sortOrder: 45 },
  { level: '2' as const, domainCode: 'IA', domainName: '식별 및 인증', requirementId: '3.5.3',  requirement: '네트워크 및 로컬 접근에 다중 인증(MFA)을 사용한다.', objective: '로컬·원격 접속 시 비밀번호 외 2차 인증(OTP, 토큰 등)이 적용되어 있는지 확인한다.', weight: 5, sortOrder: 46 },
  { level: '2' as const, domainCode: 'IA', domainName: '식별 및 인증', requirementId: '3.5.4',  requirement: '권한 있는 계정에 다중 인증(MFA)을 강제한다.', objective: '관리자 계정 접속 시 MFA가 강제되는지 확인한다.', weight: 5, sortOrder: 47 },
  { level: '2' as const, domainCode: 'IA', domainName: '식별 및 인증', requirementId: '3.5.5',  requirement: '재생 공격 방지(Replay-resistant) 인증을 적용한다.', objective: '인증값 재사용 방지(Replay Attack 방어) 조치가 적용되어 있는지 확인한다.', weight: 1, sortOrder: 48 },
  { level: '2' as const, domainCode: 'IA', domainName: '식별 및 인증', requirementId: '3.5.6',  requirement: '인증기 폐기 및 비활성화 절차를 수행한다.', objective: '인증 정보 유출 의심 시 즉시 해당 인증기를 폐기하는 절차가 있는지 확인한다.', weight: 1, sortOrder: 49 },
  { level: '2' as const, domainCode: 'IA', domainName: '식별 및 인증', requirementId: '3.5.7',  requirement: '비밀번호 복잡성 및 길이를 강제한다.', objective: '시스템 설정에서 복잡한 비밀번호 정책이 적용되어 있는지 확인한다.', weight: 1, sortOrder: 50 },
  { level: '2' as const, domainCode: 'IA', domainName: '식별 및 인증', requirementId: '3.5.8',  requirement: '비밀번호 재사용 제한 및 변경 주기를 설정한다.', objective: '이전 비밀번호 사용 제한 및 정기적인 변경 주기가 설정되어 있는지 확인한다.', weight: 1, sortOrder: 51 },
  { level: '2' as const, domainCode: 'IA', domainName: '식별 및 인증', requirementId: '3.5.9',  requirement: '초기 비밀번호를 즉시 변경하도록 강제한다.', objective: '초기 비밀번호를 사용자가 즉시 변경해야 접속되는지 확인한다.', weight: 1, sortOrder: 52 },
  { level: '2' as const, domainCode: 'IA', domainName: '식별 및 인증', requirementId: '3.5.10', requirement: '인증 중 비밀번호 표시를 숨긴다.', objective: '입력 시 비밀번호가 화면에 표시되지 않는지 확인한다.', weight: 1, sortOrder: 53 },
  { level: '2' as const, domainCode: 'IA', domainName: '식별 및 인증', requirementId: '3.5.11', requirement: '인증 데이터를 암호화하여 보호한다.', objective: '저장 또는 전송되는 모든 비밀번호·인증 정보가 암호화되어 있는지 확인한다.', weight: 3, sortOrder: 54 },

  // 6. 사고 대응 (IR) — 3개
  { level: '2' as const, domainCode: 'IR', domainName: '사고 대응', requirementId: '3.6.1', requirement: '사고 대응 계획 및 절차를 수립한다.', objective: '문서화된 사고 대응 계획서가 존재하며 최신화되어 있는지 확인한다.', weight: 3, sortOrder: 55 },
  { level: '2' as const, domainCode: 'IR', domainName: '사고 대응', requirementId: '3.6.2', requirement: '사고를 탐지, 분석, 봉쇄 및 복구한다.', objective: '사고 발생 시 조치 절차서에 따라 대응이 수행되는지 확인한다.', weight: 3, sortOrder: 56 },
  { level: '2' as const, domainCode: 'IR', domainName: '사고 대응', requirementId: '3.6.3', requirement: '사고 대응 훈련을 주기적으로 수행한다.', objective: '주기적으로 사고 대응 훈련이 실시되고 훈련 결과 보고서가 있는지 확인한다.', weight: 1, sortOrder: 57 },

  // 7. 유지보수 (MA) — 6개
  { level: '2' as const, domainCode: 'MA', domainName: '유지보수', requirementId: '3.7.1', requirement: '정보 시스템 유지보수를 수행한다.', objective: '장비 유지보수 계획 및 이행 기록이 있는지 확인한다.', weight: 1, sortOrder: 58 },
  { level: '2' as const, domainCode: 'MA', domainName: '유지보수', requirementId: '3.7.2', requirement: '유지보수 도구를 통제한다.', objective: '유지보수용 도구 및 소프트웨어가 인가되었는지 확인한다.', weight: 1, sortOrder: 59 },
  { level: '2' as const, domainCode: 'MA', domainName: '유지보수', requirementId: '3.7.3', requirement: '장비 반출 전 데이터 소독(Sanitization) 조치를 수행한다.', objective: '외부 정비 시 데이터 소독 증명이 가능한지 확인한다.', weight: 3, sortOrder: 60 },
  { level: '2' as const, domainCode: 'MA', domainName: '유지보수', requirementId: '3.7.4', requirement: '비인가 유지보수 인력을 통제한다.', objective: '외부 유지보수 인력에 대한 방문객 통제 절차가 운영되는지 확인한다.', weight: 1, sortOrder: 61 },
  { level: '2' as const, domainCode: 'MA', domainName: '유지보수', requirementId: '3.7.5', requirement: '원격 유지보수 시 다중 승인을 요구한다.', objective: '원격 접속 유지보수 시 사전에 승인 절차가 있는지 확인한다.', weight: 1, sortOrder: 62 },
  { level: '2' as const, domainCode: 'MA', domainName: '유지보수', requirementId: '3.7.6', requirement: '원격 유지보수 시 강력한 인증을 사용한다.', objective: '원격 유지보수 인력에 대해 다요소 인증이 적용되어 있는지 확인한다.', weight: 3, sortOrder: 63 },

  // 8. 매체 보호 (MP) — 9개
  { level: '2' as const, domainCode: 'MP', domainName: '매체 보호', requirementId: '3.8.1', requirement: 'CUI 매체를 보호한다.', objective: 'CUI가 담긴 서류·USB 등을 인가자만 접근 가능한 곳에 보관하는지 확인한다.', weight: 3, sortOrder: 64 },
  { level: '2' as const, domainCode: 'MP', domainName: '매체 보호', requirementId: '3.8.2', requirement: '반출 매체 접근을 제한한다.', objective: '인가받지 않은 인원이 매체를 외부로 반출할 수 없는지 확인한다.', weight: 3, sortOrder: 65 },
  { level: '2' as const, domainCode: 'MP', domainName: '매체 보호', requirementId: '3.8.3', requirement: '폐기 전 매체를 파기한다.', objective: '매체 파기 후 증명 기록·대장이 있는지 확인한다.', weight: 3, sortOrder: 66 },
  { level: '2' as const, domainCode: 'MP', domainName: '매체 보호', requirementId: '3.8.4', requirement: '매체를 식별 및 분류한다.', objective: '매체에 CUI 등급이 마킹되어 있는지 확인한다.', weight: 1, sortOrder: 67 },
  { level: '2' as const, domainCode: 'MP', domainName: '매체 보호', requirementId: '3.8.5', requirement: '인가자만 매체 저장소에 접근한다.', objective: '매체 보관 장소의 접근 제한 상태를 확인한다.', weight: 1, sortOrder: 68 },
  { level: '2' as const, domainCode: 'MP', domainName: '매체 보호', requirementId: '3.8.6', requirement: '매체 사용에 암호화를 적용한다.', objective: '이동식 매체에 암호화가 적용되어 있는지 확인한다.', weight: 3, sortOrder: 69 },
  { level: '2' as const, domainCode: 'MP', domainName: '매체 보호', requirementId: '3.8.7', requirement: '이동식 매체 사용을 승인된 기기로 통제한다.', objective: '모든 이동식 매체가 사전에 승인된 것인지 확인한다.', weight: 1, sortOrder: 70 },
  { level: '2' as const, domainCode: 'MP', domainName: '매체 보호', requirementId: '3.8.8', requirement: '조직 외부 매체 사용을 금지한다.', objective: '개인적·외부 매체 사용 금지 정책이 있는지 확인한다.', weight: 1, sortOrder: 71 },
  { level: '2' as const, domainCode: 'MP', domainName: '매체 보호', requirementId: '3.8.9', requirement: '백업 데이터에 보안을 적용한다.', objective: '백업 매체에도 암호화 등 데이터 보호 조치가 되어 있는지 확인한다.', weight: 3, sortOrder: 72 },

  // 9. 인적 보안 (PS) — 2개
  { level: '2' as const, domainCode: 'PS', domainName: '인적 보안', requirementId: '3.9.1', requirement: '직원 신원·배경 조사를 수행한다.', objective: '채용 시 배경 조사가 수행되는지 확인한다.', weight: 1, sortOrder: 73 },
  { level: '2' as const, domainCode: 'PS', domainName: '인적 보안', requirementId: '3.9.2', requirement: '퇴사 시 CUI 접근 권한을 즉시 회수한다.', objective: '퇴사 시 인사팀-IT팀 연동으로 계정이 즉시 비활성화되는지 확인한다.', weight: 5, sortOrder: 74 },

  // 10. 물리적 보호 (PE) — 6개
  { level: '2' as const, domainCode: 'PE', domainName: '물리적 보호', requirementId: '3.10.1', requirement: '운영 구역 접근을 인가된 개인으로 제한한다.', objective: '중요 시스템 구역에 인가되지 않은 인원이 출입할 수 없는지 확인한다.', weight: 3, sortOrder: 75 },
  { level: '2' as const, domainCode: 'PE', domainName: '물리적 보호', requirementId: '3.10.2', requirement: '물리적 시설 보호 절차를 수립한다.', objective: '물리적 접근 시설의 출입 시 신분 확인 절차가 운영되는지 확인한다.', weight: 1, sortOrder: 76 },
  { level: '2' as const, domainCode: 'PE', domainName: '물리적 보호', requirementId: '3.10.3', requirement: '방문자를 에스코트하고 활동 기록을 관리한다.', objective: '방문자 동행 관리 및 로그 기록 여부를 확인한다.', weight: 1, sortOrder: 77 },
  { level: '2' as const, domainCode: 'PE', domainName: '물리적 보호', requirementId: '3.10.4', requirement: '물리적 접근 감사 로그를 관리한다.', objective: '물리적 출입 기록 시스템이 운영되는지 확인한다.', weight: 1, sortOrder: 78 },
  { level: '2' as const, domainCode: 'PE', domainName: '물리적 보호', requirementId: '3.10.5', requirement: '물리적 접근 장치를 관리한다.', objective: '출입 키·카드가 관리 대장에 의해 관리되는지 확인한다.', weight: 1, sortOrder: 79 },
  { level: '2' as const, domainCode: 'PE', domainName: '물리적 보호', requirementId: '3.10.6', requirement: '원격지 물리적 보안 조치를 수행한다.', objective: '재택근무 등 원격지에서 CUI 처리 시 보안 조치가 존재하는지 확인한다.', weight: 1, sortOrder: 80 },

  // 11. 위험 평가 (RA) — 3개
  { level: '2' as const, domainCode: 'RA', domainName: '위험 평가', requirementId: '3.11.1', requirement: '보안 위험 평가를 수행한다.', objective: '정기적인 위험 평가 보고서가 있는지 확인한다.', weight: 1, sortOrder: 81 },
  { level: '2' as const, domainCode: 'RA', domainName: '위험 평가', requirementId: '3.11.2', requirement: '취약점 스캔을 수행한다.', objective: '주기적인 취약점 스캔이 실시되는지 확인한다.', weight: 3, sortOrder: 82 },
  { level: '2' as const, domainCode: 'RA', domainName: '위험 평가', requirementId: '3.11.3', requirement: '식별된 취약점을 수정한다.', objective: '스캔 결과에 따른 패치 적용 이력이 있는지 확인한다.', weight: 3, sortOrder: 83 },

  // 12. 보안 평가 (CA) — 4개
  { level: '2' as const, domainCode: 'CA', domainName: '보안 평가', requirementId: '3.12.1', requirement: '보안 통제를 주기적으로 점검한다.', objective: '주기적으로 보안 통제 항목을 평가하는지 확인한다.', weight: 1, sortOrder: 84 },
  { level: '2' as const, domainCode: 'CA', domainName: '보안 평가', requirementId: '3.12.2', requirement: 'POA&M을 작성하고 관리한다.', objective: '미충족 항목에 대한 보완 계획이 문서화되어 있는지 확인한다.', weight: 3, sortOrder: 85 },
  { level: '2' as const, domainCode: 'CA', domainName: '보안 평가', requirementId: '3.12.3', requirement: '보안 상태를 주기적으로 갱신한다.', objective: '보안 평가 결과에 따라 통제 항목을 보완·수정하는지 확인한다.', weight: 1, sortOrder: 86 },
  { level: '2' as const, domainCode: 'CA', domainName: '보안 평가', requirementId: '3.12.4', requirement: '시스템 보안 계획서(SSP)를 수립하고 유지한다.', objective: 'SSP가 작성되어 있고 110개 요구사항 구현 현황이 최신화되어 있는지 확인한다.', weight: 3, sortOrder: 87 },

  // 13. 시스템 및 통신 보호 (SC) — 16개
  { level: '2' as const, domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: '3.13.1',  requirement: '경계에서 트래픽을 모니터링하고 방화벽으로 제어한다.', objective: '경계에서 트래픽이 제어되고 모니터링되는지 확인한다.', weight: 3, sortOrder: 88 },
  { level: '2' as const, domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: '3.13.2',  requirement: '보안 아키텍처 원칙을 적용한다.', objective: '보안 설계(Zero Trust 등)가 적용되어 있는지 확인한다.', weight: 1, sortOrder: 89 },
  { level: '2' as const, domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: '3.13.3',  requirement: '보안 처리 기능을 사용자 기능과 분리한다.', objective: '보안 기능이 사용자 기능과 분리되어 있는지 확인한다.', weight: 1, sortOrder: 90 },
  { level: '2' as const, domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: '3.13.4',  requirement: '공유 리소스를 통한 정보 유출을 방지한다.', objective: '시스템 내 리소스 공유 시 정보 유출 방지 조치가 있는지 확인한다.', weight: 1, sortOrder: 91 },
  { level: '2' as const, domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: '3.13.5',  requirement: '공용 서버와 내부망을 분리한다.', objective: 'DMZ 구성 등으로 공용 서버가 내부망과 격리되어 있는지 확인한다.', weight: 3, sortOrder: 92 },
  { level: '2' as const, domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: '3.13.6',  requirement: '허용 목록 외 외부 접속을 기본 차단(Deny)한다.', objective: '방화벽 기본 정책이 Deny All인지 확인한다.', weight: 3, sortOrder: 93 },
  { level: '2' as const, domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: '3.13.7',  requirement: '원격 접속 시 스플릿 터널링을 방지한다.', objective: '원격 VPN 접속 시 스플릿 터널링이 허용되지 않는지 확인한다.', weight: 1, sortOrder: 94 },
  { level: '2' as const, domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: '3.13.8',  requirement: '전송 중인 CUI 데이터를 암호화한다.', objective: '전송 중인 CUI 데이터의 암호화(TLS 등) 적용 여부를 확인한다.', weight: 5, sortOrder: 95 },
  { level: '2' as const, domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: '3.13.9',  requirement: '비활성 네트워크 연결을 종료한다.', objective: '비활성 네트워크 인터페이스가 차단되어 있는지 확인한다.', weight: 1, sortOrder: 96 },
  { level: '2' as const, domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: '3.13.10', requirement: '암호화 키를 관리한다.', objective: '암호화 모듈 설정 및 키 관리 절차가 있는지 확인한다.', weight: 1, sortOrder: 97 },
  { level: '2' as const, domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: '3.13.11', requirement: 'FIPS 검증 암호 모듈을 사용한다.', objective: '사용 중인 암호화 모듈이 FIPS 140-2/140-3 검증을 받았는지 확인한다.', weight: 5, sortOrder: 98 },
  { level: '2' as const, domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: '3.13.12', requirement: '공유 기기 사용을 제어한다.', objective: '공유 기기 사용 시 인가 조치가 있는지 확인한다.', weight: 1, sortOrder: 99 },
  { level: '2' as const, domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: '3.13.13', requirement: '모바일 코드 실행을 제어한다.', objective: '웹·스크립트 모바일 코드 실행 제어 여부를 확인한다.', weight: 1, sortOrder: 100 },
  { level: '2' as const, domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: '3.13.14', requirement: 'VoIP 트래픽을 통제한다.', objective: 'VoIP 관련 보안 조치(암호화 등)를 확인한다.', weight: 1, sortOrder: 101 },
  { level: '2' as const, domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: '3.13.15', requirement: '통신 세션의 진위성을 보호한다.', objective: '통신 세션 재사용 방지 및 신뢰성 조치를 확인한다.', weight: 1, sortOrder: 102 },
  { level: '2' as const, domainCode: 'SC', domainName: '시스템 및 통신 보호', requirementId: '3.13.16', requirement: '저장 중인 CUI 데이터를 암호화한다.', objective: 'DB 및 파일 저장 시 CUI 데이터 암호화 적용 여부를 확인한다.', weight: 5, sortOrder: 103 },

  // 14. 시스템 및 정보 무결성 (SI) — 7개
  { level: '2' as const, domainCode: 'SI', domainName: '시스템 및 정보 무결성', requirementId: '3.14.1', requirement: '시스템 결함을 식별하고 보고한다.', objective: '보안 취약점·결함 식별 절차와 보고 체계가 있는지 확인한다.', weight: 1, sortOrder: 104 },
  { level: '2' as const, domainCode: 'SI', domainName: '시스템 및 정보 무결성', requirementId: '3.14.2', requirement: '악성코드 보호 기능을 제공한다.', objective: '전사 백신·EDR 솔루션 가동 여부를 확인한다.', weight: 3, sortOrder: 105 },
  { level: '2' as const, domainCode: 'SI', domainName: '시스템 및 정보 무결성', requirementId: '3.14.3', requirement: '악성코드 탐지 시 경고를 알린다.', objective: '백신·EDR 탐지 시 관리자에게 알람이 가는지 확인한다.', weight: 3, sortOrder: 106 },
  { level: '2' as const, domainCode: 'SI', domainName: '시스템 및 정보 무결성', requirementId: '3.14.4', requirement: '악성코드 보호 메커니즘을 정기 업데이트한다.', objective: '백신 패턴 엔진이 정기적으로 업데이트되는지 확인한다.', weight: 1, sortOrder: 107 },
  { level: '2' as const, domainCode: 'SI', domainName: '시스템 및 정보 무결성', requirementId: '3.14.5', requirement: '파일 스캔을 수행한다.', objective: '실시간 및 정기 전체 스캔 설정을 확인한다.', weight: 1, sortOrder: 108 },
  { level: '2' as const, domainCode: 'SI', domainName: '시스템 및 정보 무결성', requirementId: '3.14.6', requirement: '보안 공격을 모니터링한다.', objective: '시스템 내 공격 징후를 모니터링하는 체계가 있는지 확인한다.', weight: 3, sortOrder: 109 },
  { level: '2' as const, domainCode: 'SI', domainName: '시스템 및 정보 무결성', requirementId: '3.14.7', requirement: '시스템의 비인가 사용을 식별한다.', objective: '시스템의 비인가 행위 및 오남용을 식별하는 도구·절차가 있는지 확인한다.', weight: 1, sortOrder: 110 },
]

async function seed() {
  console.warn('=== DB 시드 시작 ===')

  // 1. 관리자 계정 생성
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'changeme123!'
  const passwordHash = await bcrypt.hash(adminPassword, 12)

  await db
    .insert(users)
    .values({ email: adminEmail, passwordHash, role: 'admin', createdBy: 'seed' })
    .onConflictDoNothing()

  console.warn(`관리자 계정: ${adminEmail}`)

  // 2. Level 1 점검항목 삽입 (최초 1회)
  await db
    .insert(checklistItems)
    .values(LEVEL1_ITEMS.map((item) => ({ ...item, createdBy: 'seed' })))
    .onConflictDoNothing()

  // 3. Level 2 점검항목 — 가중치 정확성 보장을 위해 삭제 후 재삽입
  await db.delete(checklistItems).where(eq(checklistItems.level, '2'))
  await db
    .insert(checklistItems)
    .values(LEVEL2_ITEMS.map((item) => ({ ...item, createdBy: 'seed' })))

  console.warn(
    `점검항목 삽입 완료:\n` +
    `  Level 1 (FAR 52.204-21): ${LEVEL1_ITEMS.length}개 요구사항\n` +
    `  Level 2 (NIST SP 800-171): ${LEVEL2_ITEMS.length}개 요구사항 (가중치 합계: 218점)\n` +
    `  합계: ${LEVEL1_ITEMS.length + LEVEL2_ITEMS.length}개`,
  )
  console.warn('=== DB 시드 완료 ===')
}

seed().catch((err) => {
  console.error('시드 오류:', err)
  process.exit(1)
})
