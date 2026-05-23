'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createArtifact } from '@/actions/artifacts'

interface ChecklistItemOption {
  itemId: string
  level: string
  domainCode: string
  requirementId: string
  requirement: string
}

export function ArtifactAddModal({ items }: { items: ChecklistItemOption[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [itemId, setItemId] = useState('')
  const [fileName, setFileName] = useState('')
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')

  const reset = () => {
    setItemId('')
    setFileName('')
    setUrl('')
    setNote('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemId) return toast.error('점검항목을 선택하세요')
    if (!fileName && !url) return toast.error('파일명 또는 URL을 입력하세요')

    startTransition(async () => {
      const result = await createArtifact({
        itemId,
        fileName: fileName || undefined,
        url: url || undefined,
        note: note || undefined,
      })
      if (result.success) {
        toast.success('증적이 등록되었습니다')
        setOpen(false)
        reset()
      } else {
        toast.error(result.error ?? '등록에 실패했습니다')
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">+ 증적 등록</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>증적 등록</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>점검항목 *</Label>
            <Select value={itemId} onValueChange={setItemId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="점검항목을 선택하세요" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {items.map((item) => (
                  <SelectItem key={item.itemId} value={item.itemId}>
                    <span className="font-mono text-xs text-gray-400 mr-1">
                      [L{item.level}] {item.requirementId}
                    </span>
                    <span className="text-xs text-gray-700">
                      {item.requirement.length > 50
                        ? item.requirement.substring(0, 50) + '…'
                        : item.requirement}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fileName">파일명</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="예: AC-1.1_접근통제정책.pdf"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1"
            />
          </div>

          <p className="text-xs text-gray-400">※ 파일명 또는 URL 중 하나 이상 필수</p>

          <div>
            <Label htmlFor="note">비고</Label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '저장중...' : '저장'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
