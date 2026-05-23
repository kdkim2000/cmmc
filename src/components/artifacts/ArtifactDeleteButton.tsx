'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { deleteArtifact } from '@/actions/artifacts'

export function ArtifactDeleteButton({ artifactId }: { artifactId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const result = await deleteArtifact(artifactId)
        if (result.success) {
          toast.success('증적이 삭제되었습니다')
        } else {
          toast.error(result.error ?? '삭제에 실패했습니다')
        }
        resolve()
      })
    })
  }

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700"
          disabled={isPending}
        >
          삭제
        </Button>
      }
      title="증적 삭제"
      description="이 증적을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다."
      confirmLabel="삭제"
      destructive
      onConfirm={handleDelete}
    />
  )
}
