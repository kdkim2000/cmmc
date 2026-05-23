'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'

const schema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력하세요'),
  password: z.string().min(1, '패스워드를 입력하세요'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setServerError(null)
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setServerError('이메일 또는 패스워드가 올바르지 않습니다')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            CMMC Compliance System
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            CMMC Level 1/2 인증 준비 관리 시스템
          </p>
        </div>

        {/* 로그인 폼 */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border bg-white p-8 shadow-sm"
        >
          <div className="space-y-5">
            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* 패스워드 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                패스워드
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* 서버 오류 메시지 */}
            {serverError && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {serverError}
              </div>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
