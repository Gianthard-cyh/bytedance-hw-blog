import { Kysely, Generated } from 'kysely'
import { MysqlDialect } from 'kysely'
import mysql from 'mysql2'

interface PostsTable {
  id: Generated<number>
  title: string
  content: string
  author: string | null
  status: Generated<number>
  views: Generated<number>
  created_at: Generated<Date>
  updated_at: Generated<Date>
  deleted_at: Generated<Date | null>
}

interface TagsTable {
  id: Generated<number>
  name: string
  created_at: Generated<Date>
}

interface PostTagsTable {
  post_id: number
  tag_id: number
}


interface DB {
  posts: PostsTable
  tags: TagsTable
  post_tags: PostTagsTable
}

const dbUrl = process.env.DATABASE_URL

declare global {
  var __db: Kysely<DB> | undefined
}

if (!dbUrl) {
  throw new Error('DATABASE_URL is required (MySQL).')
}

const pool = mysql.createPool({
  uri: dbUrl,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
})

export const db: Kysely<DB> = globalThis.__db ?? new Kysely<DB>({
  dialect: new MysqlDialect({ pool })
})

if (!globalThis.__db) {
  globalThis.__db = db
}
