import { Kysely, Generated } from 'kysely'
import { PostgresDialect } from 'kysely'
import { Pool } from 'pg'

interface PostsTable {
  id: Generated<number>
  title: string
  content: string
  created_at: Generated<Date>
  updated_at: Generated<Date>
  deleted_at: Generated<Date | null>
}

interface DB {
  posts: PostsTable
}

const pgUrl = process.env.DATABASE_URL

declare global {
  var __db: Kysely<DB> | undefined
}

if (!pgUrl) {
  throw new Error('DATABASE_URL is required (PostgreSQL).')
}

const pool = new Pool({
  connectionString: pgUrl,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
})

export const db: Kysely<DB> = globalThis.__db ?? new Kysely<DB>({
  dialect: new PostgresDialect({ pool })
})

if (!globalThis.__db) {
  globalThis.__db = db
}
