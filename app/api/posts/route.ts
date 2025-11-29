import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ensureDb } from '@/lib/init'
import { NextRequest } from 'next/server'
import { sql } from 'kysely'


interface PagedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

interface Post {
  id: number
  title: string
  content: string
  created_at: string
}

type GetPostListResponse = PagedResponse<Post>

export async function GET(req: NextRequest) {
  await ensureDb()
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = Number(searchParams.get('pageSize') ?? '10')
  const q = (searchParams.get('q') ?? '').trim()
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safeSize = Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 100 ? pageSize : 10
  const offset = (safePage - 1) * safeSize

  let listQ = db.selectFrom('posts')
  let countQ = db.selectFrom('posts')
  if (q) {
    const pattern = `%${q}%`
    listQ = listQ.where('title', 'like', pattern)
    countQ = countQ.where('title', 'like', pattern)
  }

  const rows = await listQ
    .selectAll()
    .orderBy('id', 'desc')
    .limit(safeSize)
    .offset(offset)
    .execute()

  const totalRow = await countQ
    .select(sql<string>`count(*)`.as('count'))
    .executeTakeFirst()
  const trimmedRows = rows.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }))
  const res: GetPostListResponse = {
    items: trimmedRows,
    total: Number(totalRow?.count ?? 0),
    page: safePage,
    pageSize: safeSize,
  }
  return Response.json(res)
}

export async function POST(req: NextRequest) {
  await ensureDb()
  const body = await req.json()
  const title = String(body?.title || '').trim()
  const content = String(body?.content || '').trim()
  if (!title || !content) {
    return new Response(JSON.stringify({ error: 'invalid_payload' }), { status: 400 })
  }
  await db.insertInto('posts').values({ title, content}).execute()
  return new Response(JSON.stringify({ success: true }), { status: 201 })
}
