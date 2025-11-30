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
  author: string | null
  status: number
  views: number
  created_at: string
  updated_at: string
  tags: string[]
}

type GetPostListResponse = PagedResponse<Post>

export async function GET(req: NextRequest) {
  await ensureDb()
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = Number(searchParams.get('pageSize') ?? '10')
  const q = (searchParams.get('q') ?? '').trim()
  const tag = (searchParams.get('tag') ?? '').trim()
  const tagsParam = searchParams.getAll('tags').map((t) => (t ?? '').trim()).filter(Boolean)
  const tags = Array.from(new Set([...(tag ? [tag] : []), ...tagsParam]))
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safeSize = Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 100 ? pageSize : 10
  const offset = (safePage - 1) * safeSize

  let listQ = db.selectFrom('posts')
  let countQ = db.selectFrom('posts')
  listQ = listQ.where('deleted_at', 'is', null)
  countQ = countQ.where('deleted_at', 'is', null)
  if (q) {
    const pattern = `%${q}%`
    listQ = listQ.where('title', 'like', pattern)
    countQ = countQ.where('title', 'like', pattern)
  }
  if (tags.length) {
    listQ = listQ.where((eb) =>
      eb.exists(
        eb
          .selectFrom('post_tags')
          .innerJoin('tags', 'tags.id', 'post_tags.tag_id')
          .select('post_tags.post_id')
          .whereRef('post_tags.post_id', '=', eb.ref('posts.id'))
          .where('tags.name', 'in', tags)
      )
    )
    countQ = countQ.where((eb) =>
      eb.exists(
        eb
          .selectFrom('post_tags')
          .innerJoin('tags', 'tags.id', 'post_tags.tag_id')
          .select('post_tags.post_id')
          .whereRef('post_tags.post_id', '=', eb.ref('posts.id'))
          .where('tags.name', 'in', tags)
      )
    )
  }

  const rows = await listQ
    .selectAll()
    .orderBy('id', 'desc')
    .limit(safeSize)
    .offset(offset)
    .execute()

  const totalRow = await countQ.select(sql<string>`count(*)`.as('count')).executeTakeFirst()
  const postIds = rows.map((r) => r.id)
  let tagsByPost: Record<number, string[]> = {}
  if (postIds.length) {
    const tagRows = await db
      .selectFrom('post_tags')
      .innerJoin('tags', 'tags.id', 'post_tags.tag_id')
      .select(['post_tags.post_id as post_id', 'tags.name as name'])
      .where('post_tags.post_id', 'in', postIds)
      .execute()
    tagsByPost = tagRows.reduce((acc, tr) => {
      const arr = acc[tr.post_id] ?? []
      arr.push(tr.name)
      acc[tr.post_id] = arr
      return acc
    }, {} as Record<number, string[]>)
  }
  const trimmedRows = rows.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    author: row.author,
    status: row.status,
    views: row.views,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
    tags: tagsByPost[row.id] ?? []
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
  let title: string
  let content: string
  let tagsInput: string[] = []
  let status: number = 0
  try {
    const body = await req.json()
    title = String(body?.title || '').trim()
    content = String(body?.content || '').trim()
    tagsInput = Array.isArray(body?.tags) ? body.tags.map((t: unknown) => String(t || '').trim()).filter(Boolean) : []
    const rawStatus = body?.status
    if (typeof rawStatus === 'number') {
      status = rawStatus
      if (status !== 0 && status !== 1) {
        return new Response(JSON.stringify({ error: 'invalid_payload' }), { status: 400 })
      }
    } else {
      return new Response(JSON.stringify({ error: 'invalid_payload' }), { status: 400 })
    }
    if (!title || !content) {
      return new Response(JSON.stringify({ error: 'invalid_payload' }), { status: 400 })
    }
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_payload' }), { status: 400 })
  }
  const postId = await db.transaction().execute(async (trx) => {
    const inserted = await trx
      .insertInto('posts')
      .values({ title, content, status })
      .returning('id')
      .executeTakeFirst()
    const id = inserted?.id
    if (!id) throw new Error('insert_failed')

    if (tagsInput.length) {
      const uniqueNames = Array.from(new Set(tagsInput))
      const tagIds: number[] = []
      for (const name of uniqueNames) {
        const up = await trx
          .insertInto('tags')
          .values({ name })
          .onConflict((oc) => oc.column('name').doUpdateSet({ name }))
          .returning('id')
          .executeTakeFirst()
        if (up?.id) tagIds.push(up.id)
      }
      if (tagIds.length) {
        await trx
          .insertInto('post_tags')
          .values(tagIds.map((tagId) => ({ post_id: id, tag_id: tagId })))
          .execute()
      }
    }
    return id
  })
  return new Response(JSON.stringify({ success: true, id: postId }), { status: 201 })
}
