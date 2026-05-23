'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { resetEvaluations, resetPoam, resetArtifacts } from '@/actions/settings'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div className="p-6 text-sm text-gray-400">로딩중...</div>
  }

  if (session?.user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-500 text-sm">관리자 전용 페이지입니다.</p>
        <Button variant="link" onClick={() => router.push('/dashboard')} className="mt-2">
          대시보드로 이동
        </Button>
      </div>
    )
  }

  const makeResetHandler =
    (
      action: () => Promise<{ success: boolean; error?: string }>,
      label: string,
    ) =>
    async () => {
      const result = await action()
      if (result.success) {
        toast.success(`${label} 초기화가 완료되었습니다`)
        router.refresh()
      } else {
        toast.error(result.error ?? `${label} 초기화에 실패했습니다`)
      }
    }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">시스템 설정</h1>

      {/* Login info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">로그인 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">이메일</span>
            <span className="font-medium">{session.user.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">권한</span>
            <span className="font-medium capitalize">{session.user.role}</span>
          </div>
        </CardContent>
      </Card>

      {/* Data reset */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">데이터 초기화</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">평가 데이터 초기화</p>
              <p className="text-xs text-gray-400 mt-0.5">
                모든 점검항목의 평가 결과(MET/NOT MET)를 삭제합니다
              </p>
            </div>
            <ConfirmDialog
              trigger={<Button variant="destructive" size="sm">초기화</Button>}
              title="평가 데이터 초기화"
              description="모든 평가 데이터를 삭제합니다. 이 작업은 되돌릴 수 없습니다."
              confirmLabel="초기화"
              destructive
              onConfirm={makeResetHandler(resetEvaluations, '평가 데이터')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">POA&M 데이터 초기화</p>
              <p className="text-xs text-gray-400 mt-0.5">
                모든 POA&M 보완 계획을 삭제합니다
              </p>
            </div>
            <ConfirmDialog
              trigger={<Button variant="destructive" size="sm">초기화</Button>}
              title="POA&M 데이터 초기화"
              description="모든 POA&M 데이터를 삭제합니다. 이 작업은 되돌릴 수 없습니다."
              confirmLabel="초기화"
              destructive
              onConfirm={makeResetHandler(resetPoam, 'POA&M')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">증적 데이터 초기화</p>
              <p className="text-xs text-gray-400 mt-0.5">
                모든 증적 등록 정보를 삭제합니다
              </p>
            </div>
            <ConfirmDialog
              trigger={<Button variant="destructive" size="sm">초기화</Button>}
              title="증적 데이터 초기화"
              description="모든 증적 데이터를 삭제합니다. 이 작업은 되돌릴 수 없습니다."
              confirmLabel="초기화"
              destructive
              onConfirm={makeResetHandler(resetArtifacts, '증적')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
