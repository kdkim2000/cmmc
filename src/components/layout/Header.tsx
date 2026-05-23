import { signOut } from '@/lib/auth'

interface HeaderProps {
  user: {
    email: string
    role: 'admin' | 'user'
  }
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">
          {user.role === 'admin' ? '관리자' : '보안담당자'}
        </span>
        <span className="text-sm font-medium text-gray-700">{user.email}</span>
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}
        >
          <button
            type="submit"
            className="rounded-md border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
          >
            로그아웃
          </button>
        </form>
      </div>
    </header>
  )
}
