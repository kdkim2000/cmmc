import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { checklistItems, evaluations } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const level = (searchParams.get('level') === '2' ? '2' : '1') as '1' | '2'

  const items = await db
    .select({
      level: checklistItems.level,
      domainCode: checklistItems.domainCode,
      domainName: checklistItems.domainName,
      requirementId: checklistItems.requirementId,
      requirement: checklistItems.requirement,
      weight: checklistItems.weight,
      evalStatus: evaluations.status,
      evalNote: evaluations.note,
    })
    .from(checklistItems)
    .leftJoin(evaluations, eq(evaluations.itemId, checklistItems.itemId))
    .where(eq(checklistItems.level, level))
    .orderBy(checklistItems.sortOrder)

  const escape = (s: string | number | null | undefined) => {
    if (s === null || s === undefined) return ''
    const str = String(s)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const header =
    level === '2'
      ? 'Level,도메인코드,도메인명,요구사항ID,요구사항,가중치,평가결과,비고'
      : 'Level,도메인코드,도메인명,요구사항ID,요구사항,평가결과,비고'

  const rows = items.map((item) => {
    const cols = [
      item.level,
      item.domainCode,
      escape(item.domainName),
      item.requirementId,
      escape(item.requirement),
    ]
    if (level === '2') cols.push(escape(item.weight))
    cols.push(item.evalStatus ?? 'not_evaluated')
    cols.push(escape(item.evalNote))
    return cols.join(',')
  })

  const csv = '﻿' + [header, ...rows].join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="cmmc-level${level}-report.csv"`,
    },
  })
}
