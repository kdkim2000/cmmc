'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { createPoam } from '@/actions/poam'

const schema = z.object({
  itemId: z.string().uuid('점검항목을 선택하세요'),
  action: z.string().min(10, '조치 내용은 10자 이상이어야 합니다'),
  responsible: z.string().min(1, '책임자를 입력하세요'),
  targetDate: z.string().min(1, '목표 완료일을 입력하세요'),
  status: z.enum(['planned', 'in_progress', 'completed']),
})

type FormData = z.infer<typeof schema>

export default function PoamNewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedItemId = searchParams.get('itemId') ?? ''
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      itemId: preselectedItemId,
      status: 'planned',
    },
  })

  const status = watch('status')

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const result = await createPoam(data)
      if (result.success) {
        toast.success('POA&M이 등록되었습니다')
        router.push('/poam')
      } else {
        toast.error(result.error ?? '등록에 실패했습니다')
      }
    })
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">POA&M 등록</h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="itemId">연결 점검항목 ID *</Label>
              <Input
                id="itemId"
                {...register('itemId')}
                placeholder="점검항목 UUID (갭 분석 페이지에서 이동 시 자동 입력)"
                className="mt-1 font-mono text-xs"
              />
              {errors.itemId && <p className="mt-1 text-xs text-red-600">{errors.itemId.message}</p>}
            </div>

            <div>
              <Label htmlFor="action">조치 내용 *</Label>
              <textarea
                id="action"
                {...register('action')}
                rows={4}
                placeholder="보완 조치 상세 내용 (10자 이상)"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
              {errors.action && <p className="mt-1 text-xs text-red-600">{errors.action.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsible">책임자 *</Label>
                <Input
                  id="responsible"
                  {...register('responsible')}
                  placeholder="홍길동"
                  className="mt-1"
                />
                {errors.responsible && <p className="mt-1 text-xs text-red-600">{errors.responsible.message}</p>}
              </div>
              <div>
                <Label htmlFor="targetDate">목표 완료일 *</Label>
                <Input
                  id="targetDate"
                  type="date"
                  {...register('targetDate')}
                  className="mt-1"
                  min={new Date().toISOString().split('T')[0]}
                />
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
                    <RadioGroupItem value={s} id={`status-${s}`} />
                    <Label htmlFor={`status-${s}`} className="cursor-pointer text-sm">
                      {s === 'planned' ? '계획중' : s === 'in_progress' ? '진행중' : '완료'}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.push('/poam')}>
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? '등록중...' : '저장'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
