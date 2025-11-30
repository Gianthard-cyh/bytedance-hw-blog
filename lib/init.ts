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
      .addColumn('author', 'text')
      .addColumn('status', 'integer', (col) => col.notNull().defaultTo(sql`0`))
      .addColumn('views', 'integer', (col) => col.notNull().defaultTo(sql`0`))
      .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('deleted_at', 'timestamp', (col) => col.defaultTo(null))
      .execute()
    await db.schema
      .createTable('tags')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('name', 'text', (col) => col.notNull().unique())
      .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
      .execute()
    await db.schema
      .createTable('post_tags')
      .ifNotExists()
      .addColumn('post_id', 'integer', (col) => col.notNull().references('posts.id').onDelete('cascade'))
      .addColumn('tag_id', 'integer', (col) => col.notNull().references('tags.id').onDelete('cascade'))
      .addUniqueConstraint('post_tags_unique', ['post_id', 'tag_id'])
      .execute()
    await db.schema
      .createIndex('post_tags_post_idx')
      .ifNotExists()
      .on('post_tags')
      .column('post_id')
      .execute()
    await db.schema
      .createIndex('post_tags_tag_idx')
      .ifNotExists()
      .on('post_tags')
      .column('tag_id')
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
