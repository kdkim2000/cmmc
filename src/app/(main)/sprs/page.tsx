import type { Metadata } from 'next'
import { db } from '@/db'
import { checklistItems, evaluations } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { sprsToPercent } from '@/lib/utils'

export const metadata: Metadata = { title: 'SPRS 시뮬레이터' }
export const dynamic = 'force-dynamic'

async function getSprsData() {
  const items = await db
    .select({
      itemId: checklistItems.itemId,
      domainCode: checklistItems.domainCode,
      domainName: checklistItems.domainName,
      requirementId: checklistItems.requirementId,
      requirement: checklistItems.requirement,
      weight: checklistItems.weight,
      status: evaluations.status,
    })
    .from(checklistItems)
    .leftJoin(evaluations, eq(evaluations.itemId, checklistItems.itemId))
    .where(eq(checklistItems.level, '2'))

  const totalItems = items.length
  const evaluatedItems = items.filter(
    (i) => i.status && i.status !== 'not_evaluated',
  ).length
  const metItems = items.filter((i) => i.status === 'met').length
  const notMetCount = items.filter((i) => i.status === 'not_met').length

  const sprsDeduction = items
    .filter((i) => i.status === 'not_met')
    .reduce((sum, i) => sum + (i.weight ?? 0), 0)
  const sprsScore = 110 - sprsDeduction

  const domainMap = new Map<
    string,
    {
      domainCode: string
      domainName: string
      notMetDeduction: number
      notMetItems: { requirementId: string; requirement: string; weight: number }[]
    }
  >()

  for (const item of items) {
    if (!domainMap.has(item.domainCode)) {
      domainMap.set(item.domainCode, {
        domainCode: item.domainCode,
        domainName: item.domainName,
        notMetDeduction: 0,
        notMetItems: [],
      })
    }
    const domain = domainMap.get(item.domainCode)!
    if (item.status === 'not_met') {
      domain.notMetDeduction += item.weight ?? 0
      domain.notMetItems.push({
        requirementId: item.requirementId,
        requirement: item.requirement,
        weight: item.weight ?? 0,
      })
    }
  }

  return {
    sprsScore,
    totalItems,
    evaluatedItems,
    metItems,
    notMetCount,
    notMetDomains: Array.from(domainMap.values()).filter((d) => d.notMetItems.length > 0),
  }
}

export default async function SprsPage() {
  const { sprsScore, totalItems, evaluatedItems, metItems, notMetCount, notMetDomains } =
    await getSprsData()

  const sprsPercent = sprsToPercent(sprsScore)
  const scoreColor =
    sprsScore >= 88
      ? 'text-green-600'
      : sprsScore >= 0
        ? 'text-amber-600'
        : 'text-red-600'

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">SPRS 점수 시뮬레이터</h1>
      <p className="text-sm text-gray-500">
        CMMC Level 2 기준. 현재 평가 결과를 바탕으로 한 예상 점수입니다.
      </p>

      {/* Score card + summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="sm:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">SPRS 예상 점수</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-5xl font-bold ${scoreColor}`}>{sprsScore}</div>
            <div className="text-xs text-gray-400 mt-1">(-108 ~ 110)</div>
            <Progress value={sprsPercent} className="mt-3 h-3" />
            <div className="text-xs text-gray-500 mt-1">{sprsPercent}% (정규화)</div>
          </CardContent>
        </Card>

        <div className="sm:col-span-3 grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">전체</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-gray-400 mt-1">Level 2 항목</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">MET</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metItems}</div>
              <p className="text-xs text-gray-400 mt-1">충족 항목</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">NOT MET</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{notMetCount}</div>
              <p className="text-xs text-gray-400 mt-1">미충족 항목</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calculation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">SPRS 계산식</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <p>
            SPRS = 110 − (NOT MET 항목 가중치 합계) = 110 −{' '}
            <strong>{110 - sprsScore}</strong> ={' '}
            <strong className={scoreColor}>{sprsScore}점</strong>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            가중치: 1점 (Critical Low) · 3점 (Critical Medium) · 5점 (Critical High — 즉시 시정 필요)
          </p>
        </CardContent>
      </Card>

      {/* Not-met domain breakdown */}
      {notMetDomains.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            도메인별 감점 내역 (NOT MET)
          </h2>
          <div className="space-y-3">
            {notMetDomains.map((domain) => (
              <Card key={domain.domainCode}>
                <CardHeader className="pb-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {domain.domainCode} — {domain.domainName}
                    </CardTitle>
                    <Badge variant="destructive" className="text-xs">
                      −{domain.notMetDeduction}점
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 space-y-1">
                  {domain.notMetItems.map((item) => (
                    <div key={item.requirementId} className="flex items-start gap-2 text-xs">
                      <Badge
                        variant="outline"
                        className={`shrink-0 ${
                          item.weight === 5
                            ? 'border-red-500 text-red-600'
                            : item.weight === 3
                              ? 'border-amber-500 text-amber-600'
                              : 'border-gray-300 text-gray-500'
                        }`}
                      >
                        −{item.weight}
                      </Badge>
                      <span className="font-mono text-gray-400 shrink-0">{item.requirementId}</span>
                      <span className="text-gray-600 line-clamp-2">{item.requirement}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Status messages */}
      {notMetCount === 0 && evaluatedItems === totalItems && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4 text-center text-sm text-green-700">
            ✅ 모든 Level 2 항목이 MET 상태입니다. 최고 점수 110점 달성!
          </CardContent>
        </Card>
      )}
      {evaluatedItems < totalItems && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4 text-center text-sm text-amber-700">
            ⚠️ 미평가 항목이 {totalItems - evaluatedItems}개 있습니다. 전체 평가 완료 후 최종
            점수를 확인하세요.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
