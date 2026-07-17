import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
import { user } from './auth-schema.js';

export const message = pgTable(
  'message',
  {
    id: text('id').primaryKey(),
    senderId: text('sender_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    receiverId: text('receiver_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    status: text('status').$type<'sent' | 'delivered' | 'read'>().default('sent').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('message_senderId_idx').on(table.senderId),
    index('message_receiverId_idx').on(table.receiverId),
  ],
);
