'use server'

import { auth } from '@/lib/auth'
import { db } from '@/db'
import { poaAndM, checklistItems } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const poamSchema = z.object({
  itemId: z.string().uuid(),
  action: z.string().min(10, '조치 내용은 10자 이상이어야 합니다'),
  responsible: z.string().min(1, '책임자를 입력하세요'),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다'),
  status: z.enum(['planned', 'in_progress', 'completed']),
})

const revalidateAll = () => {
  revalidatePath('/poam')
  revalidatePath('/gap-analysis')
  revalidatePath('/dashboard')
}

export async function createPoam(data: {
  itemId: string
  action: string
  responsible: string
  targetDate: string
  status: 'planned' | 'in_progress' | 'completed'
}) {
  const session = await auth()
  if (!session) return { success: false, error: '인증이 필요합니다' }

  const parsed = poamSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  // Business rules
  const [item] = await db
    .select({ level: checklistItems.level, weight: checklistItems.weight })
    .from(checklistItems)
    .where(eq(checklistItems.itemId, data.itemId))

  if (!item) return { success: false, error: '점검항목을 찾을 수 없습니다' }
  if (item.level === '1') return { success: false, error: 'Level 1 항목은 POA&M 등록이 불가합니다', code: 422 }
  if (item.weight === 5) return { success: false, error: '가중치 5점 항목은 POA&M 등록이 불가합니다', code: 423 }

  try {
    const [created] = await db
      .insert(poaAndM)
      .values({
        itemId: data.itemId,
        action: data.action,
        responsible: data.responsible,
        targetDate: data.targetDate,
        status: data.status,
        completedAt: data.status === 'completed' ? new Date() : null,
        createdBy: session.user.email ?? 'system',
      })
      .returning({ poamId: poaAndM.poamId })

    revalidateAll()
    return { success: true, poamId: created.poamId }
  } catch (error) {
    console.error('createPoam error:', error)
    return { success: false, error: 'POA&M 등록에 실패했습니다' }
  }
}

export async function updatePoam(
  poamId: string,
  data: {
    action: string
    responsible: string
    targetDate: string
    status: 'planned' | 'in_progress' | 'completed'
  },
) {
  const session = await auth()
  if (!session) return { success: false, error: '인증이 필요합니다' }

  try {
    await db
      .update(poaAndM)
      .set({
        action: data.action,
        responsible: data.responsible,
        targetDate: data.targetDate,
        status: data.status,
        completedAt: data.status === 'completed' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(poaAndM.poamId, poamId))

    revalidateAll()
    return { success: true }
  } catch (error) {
    console.error('updatePoam error:', error)
    return { success: false, error: 'POA&M 수정에 실패했습니다' }
  }
}

export async function deletePoam(poamId: string) {
  const session = await auth()
  if (!session) return { success: false, error: '인증이 필요합니다' }

  try {
    await db.delete(poaAndM).where(eq(poaAndM.poamId, poamId))
    revalidateAll()
    return { success: true }
  } catch (error) {
    console.error('deletePoam error:', error)
    return { success: false, error: 'POA&M 삭제에 실패했습니다' }
  }
}
