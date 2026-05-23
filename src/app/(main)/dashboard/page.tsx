import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { checklistItems, evaluations, poaAndM, artifacts } from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { DomainChart } from '@/components/dashboard/DomainChart'
import { sprsToPercent } from '@/lib/utils'

export const metadata: Metadata = { title: '대시보드' }
export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const [allItems, poamList, [{ artCount }]] = await Promise.all([
    db
      .select({
        level: checklistItems.level,
        domainCode: checklistItems.domainCode,
        domainName: checklistItems.domainName,
        weight: checklistItems.weight,
        status: evaluations.status,
      })
      .from(checklistItems)
      .leftJoin(evaluations, eq(evaluations.itemId, checklistItems.itemId)),
    db.select({ status: poaAndM.status }).from(poaAndM),
    db.select({ artCount: count() }).from(artifacts),
  ])

  const l1 = allItems.filter((i) => i.level === '1')
  const l2 = allItems.filter((i) => i.level === '2')

  const countByStatus = (items: typeof allItems) => ({
    total: items.length,
    met: items.filter((i) => i.status === 'met').length,
    notMet: items.filter((i) => i.status === 'not_met').length,
    notEvaluated: items.filter((i) => !i.status || i.status === 'not_evaluated').length,
  })

  const sprsDeduction = l2
    .filter((i) => i.status === 'not_met')
    .reduce((sum, i) => sum + (i.weight ?? 0), 0)
  const sprsScore = 110 - sprsDeduction

  // Domain stats
  const domainMap = new Map<string, { domainCode: string; domainName: string; items: typeof allItems }>()
  for (const item of allItems) {
    const key = `${item.level}-${item.domainCode}`
    if (!domainMap.has(key)) domainMap.set(key, { domainCode: item.domainCode, domainName: item.domainName, items: [] })
    domainMap.get(key)!.items.push(item)
  }

  const domainStats = Array.from(domainMap.values()).map(({ domainCode, domainName, items }) => ({
    domainCode,
    domainName,
    total: items.length,
    met: items.filter((i) => i.status === 'met').length,
    notMet: items.filter((i) => i.status === 'not_met').length,
    notEvaluated: items.filter((i) => !i.status || i.status === 'not_evaluated').length,
  }))

  const poamStats = {
    planned: poamList.filter((p) => p.status === 'planned').length,
    inProgress: poamList.filter((p) => p.status === 'in_progress').length,
    completed: poamList.filter((p) => p.status === 'completed').length,
  }

  return {
    level1: countByStatus(l1),
    level2: countByStatus(l2),
    sprsScore,
    domainStats,
    poamStats,
    artifactCount: artCount,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  const { level1, level2, sprsScore, domainStats, poamStats, artifactCount } = data

  const l1Percent = level1.total ? Math.round((level1.met / level1.total) * 100) : 0
  const l2Percent = level2.total ? Math.round((level2.met / level2.total) * 100) : 0
  const sprsPercent = sprsToPercent(sprsScore)

  const l1DomainStats = domainStats.filter((d) =>
    ['AC', 'IA', 'MP', 'PE', 'SC', 'SI'].some((code) => d.domainCode === code && d.total <= 30),
  )
  const l2DomainStats = domainStats.filter((d) => d.total > 0 && !l1DomainStats.includes(d))

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">대시보드</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/assessment/level1">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Level 1 달성률</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{l1Percent}%</div>
              <Progress value={l1Percent} className="mt-2 h-2" />
              <p className="mt-1 text-xs text-gray-500">{level1.met}/{level1.total} MET</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/assessment/level2">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Level 2 달성률</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{l2Percent}%</div>
              <Progress value={l2Percent} className="mt-2 h-2" />
              <p className="mt-1 text-xs text-gray-500">{level2.met}/{level2.total} MET</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/sprs">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">SPRS 예상 점수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sprsScore}점</div>
              <Progress value={sprsPercent} className="mt-2 h-2" />
              <p className="mt-1 text-xs text-gray-500">NOT MET: {level2.notMet}항목</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts and side stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">도메인별 MET 현황 (Level 1)</CardTitle>
            </CardHeader>
            <CardContent>
              <DomainChart data={l1DomainStats} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">도메인별 MET 현황 (Level 2)</CardTitle>
            </CardHeader>
            <CardContent>
              <DomainChart data={l2DomainStats} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Link href="/poam">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">POA&M 현황</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">계획중</span>
                  <Badge variant="outline">{poamStats.planned}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">진행중</span>
                  <Badge variant="outline">{poamStats.inProgress}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">완료</span>
                  <Badge variant="outline">{poamStats.completed}</Badge>
                </div>
                <div className="flex justify-between text-sm font-medium pt-1 border-t">
                  <span>총</span>
                  <span>{poamStats.planned + poamStats.inProgress + poamStats.completed}건</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">증적 등록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{artifactCount}건</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
