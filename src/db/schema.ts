import {
  pgTable,
  uuid,
  varchar,
  char,
  text,
  integer,
  date,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ============================================================
// TB_USERS → users
// ============================================================
export const users = pgTable('users', {
  userId: uuid('user_id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 10 }).notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: varchar('created_by', { length: 255 }).notNull().default('system'),
})

// ============================================================
// TB_CHECKLIST_ITEM → checklist_items (Seed 전용, 변경 없음)
// ============================================================
export const checklistItems = pgTable(
  'checklist_items',
  {
    itemId: uuid('item_id').primaryKey().default(sql`gen_random_uuid()`),
    level: char('level', { length: 1 }).notNull(),
    domainCode: varchar('domain_code', { length: 5 }).notNull(),
    domainName: varchar('domain_name', { length: 100 }).notNull(),
    requirementId: varchar('requirement_id', { length: 30 }).notNull(),
    requirement: text('requirement').notNull(),
    objective: text('objective'),
    weight: integer('weight'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: varchar('created_by', { length: 255 }).notNull().default('system'),
  },
  (t) => [
    index('idx_checklist_level').on(t.level),
    index('idx_checklist_domain').on(t.level, t.domainCode),
  ],
)

// ============================================================
// TB_EVALUATION → evaluations
// UNIQUE(item_id): 항목당 1개 평가, 재평가 시 UPSERT
// ============================================================
export const evaluations = pgTable(
  'evaluations',
  {
    evalId: uuid('eval_id').primaryKey().default(sql`gen_random_uuid()`),
    itemId: uuid('item_id')
      .notNull()
      .unique()
      .references(() => checklistItems.itemId, { onDelete: 'cascade' }),
    status: varchar('status', { length: 15 }).notNull().default('not_evaluated'),
    note: text('note'),
    evaluatedBy: varchar('evaluated_by', { length: 255 }),
    evaluatedAt: timestamp('evaluated_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: varchar('created_by', { length: 255 }).notNull().default('system'),
  },
  (t) => [index('idx_evaluation_status').on(t.status)],
)

// ============================================================
// TB_POA_AND_M → poa_and_m
// ============================================================
export const poaAndM = pgTable(
  'poa_and_m',
  {
    poamId: uuid('poam_id').primaryKey().default(sql`gen_random_uuid()`),
    itemId: uuid('item_id')
      .notNull()
      .references(() => checklistItems.itemId, { onDelete: 'cascade' }),
    action: text('action').notNull(),
    responsible: varchar('responsible', { length: 255 }).notNull(),
    targetDate: date('target_date').notNull(),
    status: varchar('status', { length: 15 }).notNull().default('planned'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: varchar('created_by', { length: 255 }).notNull().default('system'),
  },
  (t) => [
    index('idx_poam_item').on(t.itemId),
    index('idx_poam_status').on(t.status),
    index('idx_poam_target_date').on(t.targetDate),
  ],
)

// ============================================================
// TB_ARTIFACT → artifacts
// CHECK: file_name OR url 중 하나 이상 필수 (앱 레벨에서 검증)
// ============================================================
export const artifacts = pgTable(
  'artifacts',
  {
    artifactId: uuid('artifact_id').primaryKey().default(sql`gen_random_uuid()`),
    itemId: uuid('item_id')
      .notNull()
      .references(() => checklistItems.itemId, { onDelete: 'cascade' }),
    fileName: varchar('file_name', { length: 500 }),
    url: text('url'),
    note: text('note'),
    registeredAt: date('registered_at').notNull().default(sql`CURRENT_DATE`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: varchar('created_by', { length: 255 }).notNull().default('system'),
  },
  (t) => [index('idx_artifact_item').on(t.itemId)],
)

// ============================================================
// 관계 타입 추론용
// ============================================================
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type ChecklistItem = typeof checklistItems.$inferSelect
export type Evaluation = typeof evaluations.$inferSelect
export type NewEvaluation = typeof evaluations.$inferInsert
export type PoaAndM = typeof poaAndM.$inferSelect
export type NewPoaAndM = typeof poaAndM.$inferInsert
export type Artifact = typeof artifacts.$inferSelect
export type NewArtifact = typeof artifacts.$inferInsert
