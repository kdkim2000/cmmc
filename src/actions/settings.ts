'use server'

import { auth } from '@/lib/auth'
import { db } from '@/db'
import { evaluations, poaAndM, artifacts } from '@/db/schema'
import { revalidatePath } from 'next/cache'

const revalidateAll = () => {
  ;[
    '/dashboard',
    '/assessment/level1',
    '/assessment/level2',
    '/gap-analysis',
    '/poam',
    '/artifacts',
    '/sprs',
    '/report',
  ].forEach((p) => revalidatePath(p))
}

async function requireAdmin() {
  const session = await auth()
  if (!session) return { session: null, error: '인증이 필요합니다' }
  if (session.user.role !== 'admin') return { session: null, error: '관리자 권한이 필요합니다' }
  return { session, error: null }
}

export async function resetEvaluations() {
  const { error } = await requireAdmin()
  if (error) return { success: false, error }

  try {
    await db.delete(evaluations)
    revalidateAll()
    return { success: true }
  } catch (err) {
    console.error('resetEvaluations error:', err)
    return { success: false, error: '평가 데이터 초기화에 실패했습니다' }
  }
}

export async function resetPoam() {
  const { error } = await requireAdmin()
  if (error) return { success: false, error }

  try {
    await db.delete(poaAndM)
    revalidateAll()
    return { success: true }
  } catch (err) {
    console.error('resetPoam error:', err)
    return { success: false, error: 'POA&M 데이터 초기화에 실패했습니다' }
  }
}

export async function resetArtifacts() {
  const { error } = await requireAdmin()
  if (error) return { success: false, error }

  try {
    await db.delete(artifacts)
    revalidateAll()
    return { success: true }
  } catch (err) {
    console.error('resetArtifacts error:', err)
    return { success: false, error: '증적 데이터 초기화에 실패했습니다' }
  }
}
