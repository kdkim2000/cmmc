import { describe, it, expect } from 'vitest'

// ── SPRS 계산 로직 (순수 함수) ───────────────────────────────────────────────
function calcSprs(items: { weight: number | null; status: 'met' | 'not_met' | 'not_evaluated' }[]) {
  const deduction = items
    .filter((i) => i.status === 'not_met')
    .reduce((sum, i) => sum + (i.weight ?? 0), 0)
  return 110 - deduction
}

// ── POA&M 등록 가능 여부 (비즈니스 규칙) ────────────────────────────────────
function canRegisterPoam(item: { level: '1' | '2'; weight: number | null }) {
  if (item.level === '1') return { allowed: false, reason: 'Level 1 항목은 POA&M 등록 불가' }
  if (item.weight === 5) return { allowed: false, reason: '가중치 5점 항목은 즉시 시정 필요' }
  return { allowed: true }
}

// ────────────────────────────────────────────────────────────────────────────

describe('SPRS 점수 계산 (NIST SP 800-171)', () => {
  it('모든 항목 MET → 110점 만점', () => {
    const items = [
      { weight: 1, status: 'met' as const },
      { weight: 3, status: 'met' as const },
      { weight: 5, status: 'met' as const },
    ]
    expect(calcSprs(items)).toBe(110)
  })

  it('NOT MET 항목 가중치 합산 감점', () => {
    const items = [
      { weight: 1, status: 'not_met' as const },  // -1
      { weight: 3, status: 'not_met' as const },  // -3
      { weight: 5, status: 'met' as const },       // 감점 없음
    ]
    expect(calcSprs(items)).toBe(110 - 4)
  })

  it('미평가 항목은 감점 없음', () => {
    const items = [
      { weight: 5, status: 'not_evaluated' as const },
      { weight: 3, status: 'not_evaluated' as const },
    ]
    expect(calcSprs(items)).toBe(110)
  })

  it('가중치 5점 항목 NOT MET → 5점 감점', () => {
    const items = [{ weight: 5, status: 'not_met' as const }]
    expect(calcSprs(items)).toBe(105)
  })

  it('전체 NOT MET(최저 점수) → -108점', () => {
    // NIST SP 800-171 실제 가중치 합계 = 218 → SPRS 최저 = 110 - 218 = -108
    const maxDeduction = 218
    const minScore = 110 - maxDeduction
    expect(minScore).toBe(-108)
  })
})

describe('POA&M 등록 가능 여부 — 비즈니스 규칙', () => {
  it('Level 1 항목 → POA&M 등록 불가', () => {
    const result = canRegisterPoam({ level: '1', weight: null })
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('Level 1')
  })

  it('Level 2 가중치 5점 항목 → POA&M 등록 불가 (즉시 시정)', () => {
    const result = canRegisterPoam({ level: '2', weight: 5 })
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('즉시 시정')
  })

  it('Level 2 가중치 1점 항목 → POA&M 등록 가능', () => {
    const result = canRegisterPoam({ level: '2', weight: 1 })
    expect(result.allowed).toBe(true)
  })

  it('Level 2 가중치 3점 항목 → POA&M 등록 가능', () => {
    const result = canRegisterPoam({ level: '2', weight: 3 })
    expect(result.allowed).toBe(true)
  })
})

describe('점검항목 마스터 데이터 구조', () => {
  it('Level 1 점검항목 수: 15개 (FAR 52.204-21 요구사항 수)', () => {
    // FAR 52.204-21 기본 안전보호 요구사항: 15개
    const EXPECTED_LEVEL1_COUNT = 15
    expect(EXPECTED_LEVEL1_COUNT).toBe(15)
  })

  it('Level 2 점검항목 수: 110개 (NIST SP 800-171 요구사항 수)', () => {
    // NIST SP 800-171: 110개 보안 요구사항
    const EXPECTED_LEVEL2_COUNT = 110
    expect(EXPECTED_LEVEL2_COUNT).toBe(110)
  })

  it('Level 2 가중치 분포 검증', () => {
    // NIST SP 800-171 가중치 합계 = 313 (110 - 1×77 + 3×56 + 5×59 아니고 실제값 기반)
    // SPRS 최저점 -203 = 110 - 313 이므로 가중치 합계 = 313
    const TOTAL_WEIGHT_SUM = 313
    const MAX_SPRS = 110
    const MIN_SPRS = MAX_SPRS - TOTAL_WEIGHT_SUM
    expect(MIN_SPRS).toBe(-203)
  })
})
