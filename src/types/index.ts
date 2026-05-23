export type EvalStatus = 'met' | 'not_met' | 'not_evaluated'
export type PoamStatus = 'planned' | 'in_progress' | 'completed'
export type UserRole = 'admin' | 'user'

export interface ChecklistWithEval {
  itemId: string
  level: string
  domainCode: string
  domainName: string
  requirementId: string
  requirement: string
  objective: string | null
  weight: number | null
  sortOrder: number
  evalStatus: EvalStatus
  evalNote: string | null
  poamStatus: PoamStatus | null
  poamId: string | null
}

export interface DomainStat {
  domainCode: string
  domainName: string
  total: number
  met: number
  notMet: number
  notEvaluated: number
}

export interface DashboardStats {
  level1: { total: number; met: number; notMet: number; notEvaluated: number }
  level2: { total: number; met: number; notMet: number; notEvaluated: number }
  sprsScore: number
  domainStats: DomainStat[]
  poamStats: { planned: number; inProgress: number; completed: number }
  artifactCount: number
}

export interface SprsData {
  score: number
  totalItems: number
  evaluatedItems: number
  metItems: number
  notMetItems: NotMetItem[]
}

export interface NotMetItem {
  itemId: string
  requirementId: string
  requirement: string
  domainCode: string
  domainName: string
  weight: number
  poamStatus: PoamStatus | null
  poamId: string | null
}

export interface GapItem {
  itemId: string
  level: string
  requirementId: string
  requirement: string
  domainCode: string
  domainName: string
  weight: number | null
  evalNote: string | null
  poamStatus: PoamStatus | null
  poamId: string | null
}

export interface PoamWithItem {
  poamId: string
  itemId: string
  action: string
  responsible: string
  targetDate: string
  status: PoamStatus
  completedAt: Date | null
  createdAt: Date
  requirementId: string
  requirement: string
  domainCode: string
  domainName: string
  weight: number | null
}

export interface ArtifactWithItem {
  artifactId: string
  itemId: string
  fileName: string | null
  url: string | null
  note: string | null
  registeredAt: string
  requirementId: string
  requirement: string
  domainCode: string
  domainName: string
  level: string
}
