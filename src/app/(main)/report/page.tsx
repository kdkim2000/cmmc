import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { checklistItems, evaluations } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { WeightBadge } from '@/components/ui/WeightBadge'
import type { EvalStatus } from '@/types'

export const metadata: Metadata = { title: '평가 리포트' }
export const dynamic = 'force-dynamic'

async function getReportData(level: '1' | '2') {
  const items = await db
    .select({
      itemId: checklistItems.itemId,
      domainCode: checklistItems.domainCode,
      domainName: checklistItems.domainName,
      requirementId: checklistItems.requirementId,
      requirement: checklistItems.requirement,
      weight: checklistItems.weight,
      sortOrder: checklistItems.sortOrder,
      evalStatus: evaluations.status,
      evalNote: evaluations.note,
    })
    .from(checklistItems)
    .leftJoin(evaluations, eq(evaluations.itemId, checklistItems.itemId))
    .where(eq(checklistItems.level, level))
    .orderBy(checklistItems.sortOrder)

  const total = items.length
  const met = items.filter((i) => i.evalStatus === 'met').length
  const notMet = items.filter((i) => i.evalStatus === 'not_met').length
  const notEval = total - met - notMet

  const sprsDeduction =
    level === '2'
      ? items.filter((i) => i.evalStatus === 'not_met').reduce((s, i) => s + (i.weight ?? 0), 0)
      : null
  const sprsScore = sprsDeduction !== null ? 110 - sprsDeduction : null

  const domainMap = new Map<string, { domainName: string; items: typeof items }>()
  for (const item of items) {
    if (!domainMap.has(item.domainCode)) {
      domainMap.set(item.domainCode, { domainName: item.domainName, items: [] })
    }
    domainMap.get(item.domainCode)!.items.push(item)
  }

  return {
    total,
    met,
    notMet,
    notEval,
    sprsScore,
    domains: Array.from(domainMap.entries()).map(([domainCode, v]) => ({
      domainCode,
      ...v,
    })),
  }
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>
}) {
  const sp = await searchParams
  const level = (sp.level === '2' ? '2' : '1') as '1' | '2'
  const { total, met, notMet, notEval, sprsScore, domains } = await getReportData(level)

  const metPct = total ? Math.round((met / total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">평가 리포트</h1>
        <div className="flex items-center gap-2 no-print">
          <Link
            href="/report?level=1"
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              level === '1'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Level 1
          </Link>
          <Link
            href="/report?level=2"
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              level === '2'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Level 2
          </Link>
          <a
            href={`/api/report/export?level=${level}`}
            className="px-3 py-1 rounded text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors no-print"
          >
            CSV 내보내기
          </a>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs text-gray-500 mt-1">전체 항목</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold text-green-600">{met}</div>
            <div className="text-xs text-gray-500 mt-1">MET ({metPct}%)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold text-red-600">{notMet}</div>
            <div className="text-xs text-gray-500 mt-1">NOT MET</div>
          </CardContent>
        </Card>
        {level === '2' ? (
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{sprsScore}</div>
              <div className="text-xs text-gray-500 mt-1">SPRS 예상 점수</div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-gray-400">{notEval}</div>
              <div className="text-xs text-gray-500 mt-1">미평가</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Domain tables */}
      {domains.map((domain) => (
        <div key={domain.domainCode}>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            {domain.domainCode} — {domain.domainName}
          </h2>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 w-36">항목 ID</th>
                  {level === '2' && (
                    <th className="px-3 py-2 text-left font-medium text-gray-500 w-24">가중치</th>
                  )}
                  <th className="px-3 py-2 text-left font-medium text-gray-500">요구사항</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 w-24">평가 결과</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 w-48">비고</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {domain.items.map((item) => (
                  <tr
                    key={item.itemId}
                    className={item.evalStatus === 'not_met' ? 'bg-red-50' : ''}
                  >
                    <td className="px-3 py-2 font-mono text-gray-500">{item.requirementId}</td>
                    {level === '2' && (
                      <td className="px-3 py-2">
                        <WeightBadge weight={item.weight ?? null} showIcon={false} />
                      </td>
                    )}
                    <td className="px-3 py-2 text-gray-700">{item.requirement}</td>
                    <td className="px-3 py-2">
                      <StatusBadge
                        status={((item.evalStatus ?? 'not_evaluated') as EvalStatus)}
                      />
                    </td>
                    <td className="px-3 py-2 text-gray-500">{item.evalNote ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <p className="text-xs text-gray-400 no-print">
        보고서를 출력하려면 브라우저의 인쇄 기능(Ctrl+P)을 사용하세요.
      </p>
    </div>
  )
}
