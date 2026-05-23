'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { saveEvaluation } from '@/actions/evaluations'
import { WeightBadge } from '@/components/ui/WeightBadge'
import type { EvalStatus } from '@/types'

// Note: Textarea may not be in shadcn yet — use a plain textarea with Tailwind instead if not available

interface EvaluationFormProps {
  itemId: string
  level: '1' | '2'
  weight: number | null
  initialStatus: EvalStatus
  initialNote: string | null
}

export function EvaluationForm({
  itemId,
  level,
  weight,
  initialStatus,
  initialNote,
}: EvaluationFormProps) {
  const [status, setStatus] = useState<EvalStatus>(initialStatus)
  const [note, setNote] = useState(initialNote ?? '')
  const [isDirty, setIsDirty] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleStatusChange = (val: string) => {
    setStatus(val as EvalStatus)
    setIsDirty(true)
  }

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value)
    setIsDirty(true)
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveEvaluation(itemId, status, note)
      if (result.success) {
        setIsDirty(false)
        if (result.warning === 'weight5') {
          toast.warning('저장되었습니다. 가중치 5점 항목은 즉시 시정이 필요하며 POA&M 등록이 불가합니다.')
        } else if (result.warning === 'level1') {
          toast.success('저장되었습니다. Level 1 항목은 POA&M 등록이 불가합니다.')
        } else {
          toast.success('저장되었습니다')
        }
        router.refresh()
      } else {
        toast.error(result.error ?? '저장에 실패했습니다')
      }
    })
  }

  return (
    <div className="space-y-3">
      {level === '2' && weight !== null && (
        <WeightBadge weight={weight} />
      )}
      {status === 'not_met' && weight === 5 && (
        <div className="rounded bg-red-50 px-3 py-2 text-xs text-red-700">
          ⛔ 가중치 5점 항목 — 즉시 시정 필요. POA&M 등록 불가.
        </div>
      )}
      <RadioGroup value={status} onValueChange={handleStatusChange} className="flex gap-4">
        <div className="flex items-center gap-1.5">
          <RadioGroupItem value="met" id={`${itemId}-met`} />
          <Label htmlFor={`${itemId}-met`} className="cursor-pointer text-sm font-medium text-green-700">MET</Label>
        </div>
        <div className="flex items-center gap-1.5">
          <RadioGroupItem value="not_met" id={`${itemId}-not_met`} />
          <Label htmlFor={`${itemId}-not_met`} className="cursor-pointer text-sm font-medium text-red-700">NOT MET</Label>
        </div>
        <div className="flex items-center gap-1.5">
          <RadioGroupItem value="not_evaluated" id={`${itemId}-ne`} />
          <Label htmlFor={`${itemId}-ne`} className="cursor-pointer text-sm text-gray-500">미평가</Label>
        </div>
      </RadioGroup>

      <textarea
        value={note}
        onChange={handleNoteChange}
        placeholder="노트 (최대 2000자)"
        maxLength={2000}
        rows={2}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
      />

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || isPending}
        >
          {isPending ? '저장중...' : '저장'}
        </Button>
        {isDirty && <span className="text-xs text-amber-600">• 미저장 변경사항</span>}
        {status === 'not_met' && level === '2' && (weight ?? 0) < 5 && !isDirty && (
          <a href={`/poam/new?itemId=${itemId}`} className="text-xs text-blue-600 hover:underline">
            POA&M 등록 →
          </a>
        )}
      </div>
    </div>
  )
}
