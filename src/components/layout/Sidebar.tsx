'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  FileWarning,
  FolderOpen,
  BarChart3,
  FileText,
  Settings,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  adminOnly?: boolean
  children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  { label: '대시보드', href: '/dashboard', icon: LayoutDashboard },
  {
    label: '점검 평가',
    href: '/assessment/level1',
    icon: ClipboardCheck,
    children: [
      { label: 'Level 1 점검', href: '/assessment/level1' },
      { label: 'Level 2 점검', href: '/assessment/level2' },
    ],
  },
  { label: '갭 분석', href: '/gap-analysis', icon: AlertTriangle },
  { label: '보완 계획 (POA&M)', href: '/poam', icon: FileWarning },
  { label: '증적 관리', href: '/artifacts', icon: FolderOpen },
  { label: 'SPRS 시뮬레이터', href: '/sprs', icon: BarChart3 },
  { label: '평가 리포트', href: '/report', icon: FileText },
  { label: '시스템 설정', href: '/settings', icon: Settings, adminOnly: true },
]

interface SidebarProps {
  userRole: 'admin' | 'user'
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const visibleItems = navItems.filter((item) => !item.adminOnly || userRole === 'admin')

  return (
    <aside className="flex w-56 flex-col border-r bg-white">
      {/* 로고 */}
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-sm font-bold text-primary">CMMC Compliance</span>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5 px-2">
          {visibleItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
              {/* 하위 메뉴 */}
              {item.children && isActive(item.href) && (
                <ul className="mt-0.5 space-y-0.5 pl-6">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className={cn(
                          'block rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                          pathname === child.href
                            ? 'text-primary'
                            : 'text-gray-500 hover:text-gray-900',
                        )}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
