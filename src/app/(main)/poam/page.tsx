import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { poaAndM, checklistItems } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { PoamStatus } from '@/types'
import { WeightBadge } from '@/components/ui/WeightBadge'

export const metadata: Metadata = { title: '보완 계획 (POA&M)' }
export const dynamic = 'force-dynamic'

async function getPoamList(statusFilter?: string) {
  const rows = await db
    .select({
      poamId: poaAndM.poamId,
      action: poaAndM.action,
      responsible: poaAndM.responsible,
      targetDate: poaAndM.targetDate,
      status: poaAndM.status,
      completedAt: poaAndM.completedAt,
      itemId: checklistItems.itemId,
      requirementId: checklistItems.requirementId,
      requirement: checklistItems.requirement,
      domainCode: checklistItems.domainCode,
      domainName: checklistItems.domainName,
      weight: checklistItems.weight,
    })
    .from(poaAndM)
    .innerJoin(checklistItems, eq(checklistItems.itemId, poaAndM.itemId))
    .orderBy(asc(poaAndM.targetDate))

  if (statusFilter && statusFilter !== 'all') {
    return rows.filter((r) => r.status === statusFilter)
  }
  return rows
}

export default async function PoamPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'all' } = await searchParams
  const items = await getPoamList(status)

  const statusOptions = [
    { value: 'all', label: '전체' },
    { value: 'planned', label: '계획중' },
    { value: 'in_progress', label: '진행중' },
    { value: 'completed', label: '완료' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">보완 계획 (POA&M)</h1>
        <Link
          href="/poam/new"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + POA&M 등록
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {statusOptions.map((opt) => (
            <Link
              key={opt.value}
              href={`/poam?status=${opt.value}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                status === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
        <span className="text-sm text-gray-500">총 {items.length}건</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-gray-400">
          <p>등록된 POA&M이 없습니다.</p>
          <Link href="/gap-analysis" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
            갭 분석에서 NOT MET 항목 확인 →
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs text-gray-500">
                <th className="px-4 py-2 text-left">항목 ID / 가중치</th>
                <th className="px-4 py-2 text-left">도메인</th>
                <th className="px-4 py-2 text-left">조치 내용</th>
                <th className="px-4 py-2 text-left w-24">책임자</th>
                <th className="px-4 py-2 text-left w-24">목표일</th>
                <th className="px-4 py-2 text-left w-20">상태</th>
                <th className="px-4 py-2 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.poamId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-gray-600">{item.requirementId}</div>
                    <WeightBadge weight={item.weight} showIcon={true} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{item.domainCode}</td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="truncate text-gray-800">{item.action}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{item.responsible}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{item.targetDate}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status as PoamStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/poam/${item.poamId}/edit`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      수정
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
