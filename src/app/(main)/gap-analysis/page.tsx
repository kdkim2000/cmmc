import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { checklistItems, evaluations, poaAndM } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { WeightBadge } from '@/components/ui/WeightBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { PoamStatus } from '@/types'

export const metadata: Metadata = { title: '갭 분석' }
export const dynamic = 'force-dynamic'

async function getGapItems(levelFilter: string) {
  const rows = await db
    .select({
      itemId: checklistItems.itemId,
      level: checklistItems.level,
      domainCode: checklistItems.domainCode,
      domainName: checklistItems.domainName,
      requirementId: checklistItems.requirementId,
      requirement: checklistItems.requirement,
      weight: checklistItems.weight,
      evalNote: evaluations.note,
      poamId: poaAndM.poamId,
      poamStatus: poaAndM.status,
    })
    .from(checklistItems)
    .innerJoin(evaluations, eq(evaluations.itemId, checklistItems.itemId))
    .leftJoin(poaAndM, eq(poaAndM.itemId, checklistItems.itemId))
    .where(
      levelFilter === '1'
        ? and(eq(evaluations.status, 'not_met'), eq(checklistItems.level, '1'))
        : levelFilter === '2'
        ? and(eq(evaluations.status, 'not_met'), eq(checklistItems.level, '2'))
        : eq(evaluations.status, 'not_met'),
    )

  return rows
}

export default async function GapAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>
}) {
  const { level = 'all' } = await searchParams
  const items = await getGapItems(level)

  // Group by level + domain
  const groups = new Map<string, { level: string; domainCode: string; domainName: string; items: typeof items }>()
  for (const item of items) {
    const key = `${item.level}-${item.domainCode}`
    if (!groups.has(key)) groups.set(key, { level: item.level, domainCode: item.domainCode, domainName: item.domainName, items: [] })
    groups.get(key)!.items.push(item)
  }

  const l1Count = items.filter((i) => i.level === '1').length
  const l2Count = items.filter((i) => i.level === '2').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">갭 분석</h1>
        <div className="flex gap-1">
          {(['all', '1', '2'] as const).map((v) => (
            <Link
              key={v}
              href={`/gap-analysis?level=${v}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                level === v
                  ? 'bg-primary text-primary-foreground'
                  : 'border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {v === 'all' ? '전체' : `Level ${v}`}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-amber-50 px-4 py-3">
        <p className="text-sm font-medium text-amber-800">
          NOT MET 항목: 총 {items.length}건 (L1: {l1Count}건 / L2: {l2Count}건)
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-green-50 p-6 text-center">
          <p className="text-green-700 font-medium">✅ NOT MET 항목 없음</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(groups.values()).map(({ level: lv, domainCode, domainName, items: groupItems }) => (
            <div key={`${lv}-${domainCode}`} className="rounded-lg border bg-white overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <span className="text-sm font-medium">
                  Level {lv} — {domainCode} {domainName} ({groupItems.length}건)
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500 text-xs">
                    <th className="px-4 py-2 text-left w-32">요구사항 ID</th>
                    <th className="px-4 py-2 text-left">요구사항 내용</th>
                    {lv === '2' && <th className="px-4 py-2 text-left w-20">가중치</th>}
                    <th className="px-4 py-2 text-left w-28">POA&M</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {groupItems.map((item) => (
                    <tr key={item.itemId}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.requirementId}</td>
                      <td className="px-4 py-3">
                        <p className="text-gray-800">{item.requirement}</p>
                        {item.evalNote && <p className="mt-0.5 text-xs text-gray-400">{item.evalNote}</p>}
                      </td>
                      {lv === '2' && (
                        <td className="px-4 py-3">
                          <WeightBadge weight={item.weight} showIcon={true} />
                        </td>
                      )}
                      <td className="px-4 py-3">
                        {item.level === '1' ? (
                          <span className="text-xs text-gray-400">등록 불가</span>
                        ) : item.weight === 5 ? (
                          <span className="text-xs text-red-600">즉시 시정 필요</span>
                        ) : item.poamId ? (
                          <Link href={`/poam/${item.poamId}/edit`}>
                            <StatusBadge status={item.poamStatus as PoamStatus | null} />
                          </Link>
                        ) : (
                          <Link
                            href={`/poam/new?itemId=${item.itemId}`}
                            className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                          >
                            POA&M 등록
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
