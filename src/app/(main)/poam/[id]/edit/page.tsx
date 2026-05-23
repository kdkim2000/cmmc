'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { updatePoam, deletePoam } from '@/actions/poam'

const schema = z.object({
  action: z.string().min(10, '조치 내용은 10자 이상이어야 합니다'),
  responsible: z.string().min(1, '책임자를 입력하세요'),
  targetDate: z.string().min(1, '목표 완료일을 입력하세요'),
  status: z.enum(['planned', 'in_progress', 'completed']),
})

type FormData = z.infer<typeof schema>

export default function PoamEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [poamId, setPoamId] = useState('')
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'planned' },
  })

  const status = watch('status')

  useEffect(() => {
    params.then(({ id }) => {
      setPoamId(id)
      // Fetch POA&M data
      fetch(`/api/poam/${id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data) {
            reset({
              action: data.action,
              responsible: data.responsible,
              targetDate: data.targetDate,
              status: data.status,
            })
          }
          setLoading(false)
        })
        .catch(() => {
          toast.error('데이터를 불러오지 못했습니다')
          setLoading(false)
        })
    })
  }, [params, reset])

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const result = await updatePoam(poamId, data)
      if (result.success) {
        toast.success('POA&M이 수정되었습니다')
        router.push('/poam')
      } else {
        toast.error(result.error ?? '수정에 실패했습니다')
      }
    })
  }

  const handleDelete = async () => {
    const result = await deletePoam(poamId)
    if (result.success) {
      toast.success('POA&M이 삭제되었습니다')
      router.push('/poam')
    } else {
      toast.error(result.error ?? '삭제에 실패했습니다')
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-400">로딩중...</div>
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">POA&M 수정</h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="action">조치 내용 *</Label>
              <textarea
                id="action"
                {...register('action')}
                rows={4}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
              {errors.action && <p className="mt-1 text-xs text-red-600">{errors.action.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsible">책임자 *</Label>
                <Input id="responsible" {...register('responsible')} className="mt-1" />
                {errors.responsible && <p className="mt-1 text-xs text-red-600">{errors.responsible.message}</p>}
              </div>
              <div>
                <Label htmlFor="targetDate">목표 완료일 *</Label>
                <Input id="targetDate" type="date" {...register('targetDate')} className="mt-1" />
                {errors.targetDate && <p className="mt-1 text-xs text-red-600">{errors.targetDate.message}</p>}
              </div>
            </div>

            <div>
              <Label>진행 상태 *</Label>
              <RadioGroup
                value={status}
                onValueChange={(v) => setValue('status', v as FormData['status'])}
                className="flex gap-4 mt-2"
              >
                {(['planned', 'in_progress', 'completed'] as const).map((s) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <RadioGroupItem value={s} id={`edit-status-${s}`} />
                    <Label htmlFor={`edit-status-${s}`} className="cursor-pointer text-sm">
                      {s === 'planned' ? '계획중' : s === 'in_progress' ? '진행중' : '완료'}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between pt-2">
              <ConfirmDialog
                trigger={<Button type="button" variant="destructive" size="sm">삭제</Button>}
                title="POA&M 삭제"
                description="이 POA&M 항목을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다."
                confirmLabel="삭제"
                destructive
                onConfirm={handleDelete}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => router.push('/poam')}>
                  취소
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? '저장중...' : '저장'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
