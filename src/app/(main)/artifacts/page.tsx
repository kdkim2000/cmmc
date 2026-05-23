import type { Metadata } from 'next'
import { db } from '@/db'
import { artifacts, checklistItems } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Badge } from '@/components/ui/badge'
import { ArtifactAddModal } from '@/components/artifacts/ArtifactAddModal'
import { ArtifactDeleteButton } from '@/components/artifacts/ArtifactDeleteButton'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: '증적 관리' }
export const dynamic = 'force-dynamic'

async function getArtifacts() {
  return db
    .select({
      artifactId: artifacts.artifactId,
      fileName: artifacts.fileName,
      url: artifacts.url,
      note: artifacts.note,
      registeredAt: artifacts.registeredAt,
      level: checklistItems.level,
      domainCode: checklistItems.domainCode,
      domainName: checklistItems.domainName,
      requirementId: checklistItems.requirementId,
      requirement: checklistItems.requirement,
    })
    .from(artifacts)
    .innerJoin(checklistItems, eq(artifacts.itemId, checklistItems.itemId))
    .orderBy(checklistItems.level, checklistItems.sortOrder)
}

async function getChecklistItemOptions() {
  return db
    .select({
      itemId: checklistItems.itemId,
      level: checklistItems.level,
      domainCode: checklistItems.domainCode,
      requirementId: checklistItems.requirementId,
      requirement: checklistItems.requirement,
    })
    .from(checklistItems)
    .orderBy(checklistItems.level, checklistItems.sortOrder)
}

export default async function ArtifactsPage() {
  const [artifactList, itemOptions] = await Promise.all([getArtifacts(), getChecklistItemOptions()])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">증적 관리</h1>
          <p className="text-xs text-gray-400 mt-0.5">총 {artifactList.length}건</p>
        </div>
        <ArtifactAddModal items={itemOptions} />
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        {artifactList.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            등록된 증적이 없습니다.
            <br />
            우측 상단 &apos;+ 증적 등록&apos; 버튼을 클릭하세요.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">도메인</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">항목 ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">증적 내용</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">등록일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {artifactList.map((art) => (
                <tr key={art.artifactId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">
                      Level {art.level}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {art.domainCode}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {art.requirementId}
                  </td>
                  <td className="px-4 py-3 max-w-sm">
                    <div className="space-y-0.5">
                      {art.fileName && (
                        <div className="text-xs text-gray-700">📄 {art.fileName}</div>
                      )}
                      {art.url && (
                        <a
                          href={art.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 underline truncate block max-w-xs"
                        >
                          🔗 {art.url}
                        </a>
                      )}
                      {art.note && (
                        <div className="text-xs text-gray-400">{art.note}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(art.registeredAt)}
                  </td>
                  <td className="px-4 py-3">
                    <ArtifactDeleteButton artifactId={art.artifactId} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
