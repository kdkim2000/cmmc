/**
 * DB 시드 스크립트
 * 실행: npm run db:seed
 *
 * 처리 순서:
 *   1. checklist_items — CMMC Level 1/2 마스터 데이터
 *   2. users           — 초기 관리자 계정
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { checklistItems, users } from './schema'
import bcrypt from 'bcryptjs'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

// ============================================================
// Level 1 점검항목 (FAR 52.204-21) — 샘플 데이터
// 전체 58개 평가목표는 src/db/seeds/level1.json 에서 관리
// ============================================================
const LEVEL1_ITEMS = [
  {
    level: '1' as const,
    domainCode: 'AC',
    domainName: '접근 통제',
    requirementId: 'AC.L1-b.1.i',
    requirement: '인가된 사용자, 인가된 사용자를 대신해 동작하는 프로세스, 장치(다른 정보 시스템 포함)에만 정보 시스템 접근을 허용한다.',
    objective: '시스템 접근이 인가된 사용자에게만 허용되는지 확인한다.',
    weight: null,
    sortOrder: 1,
  },
  {
    level: '1' as const,
    domainCode: 'AC',
    domainName: '접근 통제',
    requirementId: 'AC.L1-b.1.ii',
    requirement: '인가된 사용자가 수행하도록 허용된 트랜잭션 및 기능의 유형에 대한 정보 시스템 접근을 제한한다.',
    objective: '시스템 접근이 인가된 활동 유형으로 제한되는지 확인한다.',
    weight: null,
    sortOrder: 2,
  },
  {
    level: '1' as const,
    domainCode: 'IA',
    domainName: '식별 및 인증',
    requirementId: 'IA.L1-b.5.i',
    requirement: '정보 시스템 사용자(또는 사용자를 대신해 동작하는 프로세스)를 식별한다.',
    objective: '정보 시스템 사용자 식별 여부를 확인한다.',
    weight: null,
    sortOrder: 10,
  },
  {
    level: '1' as const,
    domainCode: 'IA',
    domainName: '식별 및 인증',
    requirementId: 'IA.L1-b.5.ii',
    requirement: '접근 허가 이전에 해당 사용자, 프로세스 또는 장치의 신원을 인증(또는 검증)한다.',
    objective: '접근 허가 전 사용자 인증 수행 여부를 확인한다.',
    weight: null,
    sortOrder: 11,
  },
]

// ============================================================
// Level 2 점검항목 (NIST SP 800-171A) — 샘플 데이터
// 전체 110개 요구사항은 src/db/seeds/level2.json 에서 관리
// ============================================================
const LEVEL2_ITEMS = [
  {
    level: '2' as const,
    domainCode: 'AC',
    domainName: '접근 통제',
    requirementId: '3.1.1',
    requirement: '인가된 사용자, 인가된 사용자를 대신해 동작하는 프로세스, 장치에만 시스템 접근을 허용한다.',
    objective: null,
    weight: 1,
    sortOrder: 1,
  },
  {
    level: '2' as const,
    domainCode: 'AC',
    domainName: '접근 통제',
    requirementId: '3.1.3',
    requirement: 'CUI 흐름을 시스템 내·외부 다른 시스템으로의 흐름을 제어한다.',
    objective: null,
    weight: 3,
    sortOrder: 3,
  },
  {
    level: '2' as const,
    domainCode: 'IA',
    domainName: '식별 및 인증',
    requirementId: '3.5.3',
    requirement: '로컬 및 네트워크 접근(권한 있는 계정)과 비로컬 접근에 다중 인증(MFA)을 사용한다.',
    objective: null,
    weight: 5,
    sortOrder: 30,
  },
]

async function seed() {
  console.warn('=== DB 시드 시작 ===')

  // 1. 관리자 계정 생성
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'changeme123!'
  const passwordHash = await bcrypt.hash(adminPassword, 12)

  await db
    .insert(users)
    .values({
      email: adminEmail,
      passwordHash,
      role: 'admin',
      createdBy: 'seed',
    })
    .onConflictDoNothing()

  console.warn(`관리자 계정 생성: ${adminEmail}`)

  // 2. 점검항목 마스터 시드
  const allItems = [...LEVEL1_ITEMS, ...LEVEL2_ITEMS]
  await db.insert(checklistItems).values(
    allItems.map((item) => ({ ...item, createdBy: 'seed' })),
  ).onConflictDoNothing()

  console.warn(`점검항목 삽입: ${allItems.length}개 (샘플)`)
  console.warn('※ 전체 데이터(168개)를 위해 src/db/seeds/level1.json, level2.json 을 추가하세요.')
  console.warn('=== DB 시드 완료 ===')
}

seed().catch((err) => {
  console.error('시드 오류:', err)
  process.exit(1)
})
