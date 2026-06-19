import { pgTable, serial, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high', 'critical']);
export const categoryEnum = pgEnum('category', ['bug_fix', 'enhancement', 'new_feature']);
export const statusEnum = pgEnum('status', ['submitted', 'in_progress', 'in_review', 'completed']);

export const requests = pgTable('requests', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  priority: priorityEnum('priority').notNull().default('medium'),
  category: categoryEnum('category').notNull().default('enhancement'),
  status: statusEnum('status').notNull().default('submitted'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

export type Request = typeof requests.$inferSelect;
export type NewRequest = typeof requests.$inferInsert;
