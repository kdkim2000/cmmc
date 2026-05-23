'use server'

import { auth } from '@/lib/auth'
import { db } from '@/db'
import { artifacts, checklistItems } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const artifactSchema = z
  .object({
    itemId: z.string().uuid('유효한 항목을 선택하세요'),
    fileName: z.string().max(500).optional(),
    url: z.string().url('유효한 URL을 입력하세요').max(2000).optional(),
    note: z.string().max(1000).optional(),
  })
  .refine((d) => d.fileName || d.url, { message: '파일명 또는 URL 중 하나 이상 입력하세요' })

const revalidateAll = () => {
  revalidatePath('/artifacts')
  revalidatePath('/dashboard')
}

export async function createArtifact(data: {
  itemId: string
  fileName?: string
  url?: string
  note?: string
}) {
  const session = await auth()
  if (!session) return { success: false, error: '인증이 필요합니다' }

  const parsed = artifactSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const [item] = await db
    .select({ itemId: checklistItems.itemId })
    .from(checklistItems)
    .where(eq(checklistItems.itemId, data.itemId))
  if (!item) return { success: false, error: '점검항목을 찾을 수 없습니다' }

  try {
    const [created] = await db
      .insert(artifacts)
      .values({
        itemId: data.itemId,
        fileName: data.fileName ?? null,
        url: data.url ?? null,
        note: data.note ?? null,
        createdBy: session.user.email ?? 'system',
      })
      .returning({ artifactId: artifacts.artifactId })

    revalidateAll()
    return { success: true, artifactId: created.artifactId }
  } catch (error) {
    console.error('createArtifact error:', error)
    return { success: false, error: '증적 등록에 실패했습니다' }
  }
}

export async function deleteArtifact(artifactId: string) {
  const session = await auth()
  if (!session) return { success: false, error: '인증이 필요합니다' }

  try {
    await db.delete(artifacts).where(eq(artifacts.artifactId, artifactId))
    revalidateAll()
    return { success: true }
  } catch (error) {
    console.error('deleteArtifact error:', error)
    return { success: false, error: '증적 삭제에 실패했습니다' }
  }
}
