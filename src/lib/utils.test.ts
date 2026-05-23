import { describe, it, expect } from 'vitest'
import { sprsToPercent, formatDate, formatDateTime } from './utils'

describe('sprsToPercent', () => {
  it('최솟값 -108 → 0%', () => {
    expect(sprsToPercent(-108)).toBe(0)
  })

  it('최댓값 110 → 100%', () => {
    expect(sprsToPercent(110)).toBe(100)
  })

  it('중간값 0 → 50%', () => {
    // (-108 ~ 110 범위에서 0의 위치: (0 - (-108)) / (110 - (-108)) = 108/218 ≈ 49.5 → 50)
    expect(sprsToPercent(0)).toBe(50)
  })

  it('모든 MET(110점) → 100%', () => {
    expect(sprsToPercent(110)).toBe(100)
  })

  it('SPRS 88점 (CMMC 합격 기준) → 89% 이상', () => {
    // (88 - (-108)) / (110 - (-108)) = 196/218 ≈ 89.9 → 90
    const pct = sprsToPercent(88)
    expect(pct).toBeGreaterThanOrEqual(89)
  })
})

describe('formatDate', () => {
  it('Date 객체를 한국어 날짜 형식으로 변환', () => {
    const result = formatDate(new Date('2026-05-24'))
    expect(result).toContain('2026')
    expect(result).toContain('05')
    expect(result).toContain('24')
  })

  it('ISO 문자열을 날짜 형식으로 변환', () => {
    const result = formatDate('2026-05-24T00:00:00.000Z')
    expect(result).toContain('2026')
  })
})

describe('formatDateTime', () => {
  it('Date 객체를 한국어 날짜시간 형식으로 변환', () => {
    const result = formatDateTime(new Date('2026-05-24T09:30:00'))
    expect(result).toContain('2026')
  })
})
