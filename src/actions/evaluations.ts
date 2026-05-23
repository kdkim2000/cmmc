'use server'

import { auth } from '@/lib/auth'
import { db } from '@/db'
import { evaluations, checklistItems } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function saveEvaluation(
  itemId: string,
  status: 'met' | 'not_met' | 'not_evaluated',
  note: string,
) {
  const session = await auth()
  if (!session) return { success: false, error: '인증이 필요합니다' }

  try {
    // Check if Level 1 or weight=5 item trying to be marked not_met — just for warning, save anyway
    await db
      .insert(evaluations)
      .values({
        itemId,
        status,
        note: note.trim() || null,
        evaluatedBy: session.user.email,
        evaluatedAt: new Date(),
        createdBy: session.user.email ?? 'system',
      })
      .onConflictDoUpdate({
        target: evaluations.itemId,
        set: {
          status,
          note: note.trim() || null,
          evaluatedBy: session.user.email,
          evaluatedAt: new Date(),
          updatedAt: new Date(),
        },
      })

    revalidatePath('/assessment/level1')
    revalidatePath('/assessment/level2')
    revalidatePath('/dashboard')
    revalidatePath('/gap-analysis')
    revalidatePath('/sprs')

    // Check if weight=5 NOT MET — return warning
    if (status === 'not_met') {
      const [item] = await db
        .select({ level: checklistItems.level, weight: checklistItems.weight })
        .from(checklistItems)
        .where(eq(checklistItems.itemId, itemId))

      if (item?.weight === 5) {
        return { success: true, warning: 'weight5' }
      }
      if (item?.level === '1') {
        return { success: true, warning: 'level1' }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('saveEvaluation error:', error)
    return { success: false, error: '저장에 실패했습니다' }
  }
}
