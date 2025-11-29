import { db } from './db'
import { sql } from 'kysely'

declare global {
  var __dbInitDone: boolean | undefined
}

export async function ensureDb() {
  if (!globalThis.__dbInitDone) {
    await db.schema
      .createTable('posts')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('title', 'text', (col) => col.notNull())
      .addColumn('content', 'text', (col) => col.notNull())
      .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('deleted_at', 'timestamp', (col) => col.defaultTo(null))
      .execute()
    await db.schema
      .createIndex('posts_title_idx')
      .ifNotExists()
      .on('posts')
      .column('title')
      .execute()
    globalThis.__dbInitDone = true
  }
}
