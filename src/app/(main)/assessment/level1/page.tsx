import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { checklistItems, evaluations } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { EvaluationForm } from '@/components/assessment/EvaluationForm'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { EvalStatus } from '@/types'

export const metadata: Metadata = { title: 'Level 1 점검' }
export const dynamic = 'force-dynamic'

async function getLevel1Items() {
  return db
    .select({
      itemId: checklistItems.itemId,
      domainCode: checklistItems.domainCode,
      domainName: checklistItems.domainName,
      requirementId: checklistItems.requirementId,
      requirement: checklistItems.requirement,
      objective: checklistItems.objective,
      sortOrder: checklistItems.sortOrder,
      evalStatus: evaluations.status,
      evalNote: evaluations.note,
    })
    .from(checklistItems)
    .leftJoin(evaluations, eq(evaluations.itemId, checklistItems.itemId))
    .where(eq(checklistItems.level, '1'))
    .orderBy(asc(checklistItems.sortOrder))
}

export default async function Level1Page() {
  const items = await getLevel1Items()

  // Group by domain
  const domains = new Map<string, { domainCode: string; domainName: string; items: typeof items }>()
  for (const item of items) {
    if (!domains.has(item.domainCode)) {
      domains.set(item.domainCode, { domainCode: item.domainCode, domainName: item.domainName, items: [] })
    }
    domains.get(item.domainCode)!.items.push(item)
  }

  const total = items.length
  const met = items.filter((i) => i.evalStatus === 'met').length
  const percent = total ? Math.round((met / total) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">점검 평가</h1>
        <div className="flex gap-2">
          <Link href="/assessment/level1" className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">Level 1</Link>
          <Link href="/assessment/level2" className="rounded-md border px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Level 2</Link>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium">전체 진행률</span>
          <span className="text-gray-500">{met}/{total} MET ({percent}%)</span>
        </div>
        <Progress value={percent} className="h-2" />
      </div>

      {/* Domain accordions */}
      <Accordion type="multiple" className="space-y-2">
        {Array.from(domains.values()).map(({ domainCode, domainName, items: domainItems }) => {
          const dMet = domainItems.filter((i) => i.evalStatus === 'met').length
          const dNotMet = domainItems.filter((i) => i.evalStatus === 'not_met').length
          const dNe = domainItems.filter((i) => !i.evalStatus || i.evalStatus === 'not_evaluated').length

          return (
            <AccordionItem key={domainCode} value={domainCode} className="rounded-lg border bg-white">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <span className="font-medium">{domainCode} — {domainName}</span>
                  <span className="text-xs text-gray-400">
                    {domainItems.length}항목 | {dMet} MET, {dNotMet} NOT MET, {dNe} 미평가
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 divide-y">
                  {domainItems.map((item) => (
                    <div key={item.itemId} className="pt-4 first:pt-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">{item.requirementId}</span>
                            <StatusBadge status={(item.evalStatus as EvalStatus) ?? 'not_evaluated'} />
                          </div>
                          <p className="mt-0.5 text-sm text-gray-600">{item.requirement}</p>
                          {item.objective && (
                            <p className="mt-1 text-xs text-gray-400 italic">{item.objective}</p>
                          )}
                        </div>
                      </div>
                      <EvaluationForm
                        itemId={item.itemId}
                        level="1"
                        weight={null}
                        initialStatus={(item.evalStatus as EvalStatus) ?? 'not_evaluated'}
                        initialNote={item.evalNote}
                      />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
