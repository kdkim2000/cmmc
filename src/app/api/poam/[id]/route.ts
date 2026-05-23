import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { poaAndM } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const [poam] = await db.select().from(poaAndM).where(eq(poaAndM.poamId, id))
  if (!poam) return Response.json(null, { status: 404 })
  return Response.json(poam)
}
