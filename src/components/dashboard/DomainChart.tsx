'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { DomainStat } from '@/types'

interface DomainChartProps {
  data: DomainStat[]
}

export function DomainChart({ data }: DomainChartProps) {
  if (data.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-8">데이터 없음</p>
  }

  const chartData = data.map((d) => ({
    name: `${d.domainCode}`,
    MET: d.met,
    'NOT MET': d.notMet,
    미평가: d.notEvaluated,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="MET" stackId="a" fill="#22c55e" />
        <Bar dataKey="NOT MET" stackId="a" fill="#ef4444" />
        <Bar dataKey="미평가" stackId="a" fill="#d1d5db" />
      </BarChart>
    </ResponsiveContainer>
  )
}
