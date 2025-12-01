import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ensureDb } from '@/lib/init'
import { sql } from 'kysely'

type RouteContext = { params: Promise<{ id: string }> }

async function parseId(req: NextRequest, params?: Promise<{ id: string }>) {
  if (params) {
    const { id } = await params
    const n = Number(id)
    return Number.isFinite(n) ? n : null
  }
  const idStr = new URL(req.url).pathname.split('/').pop()
  const id = Number(idStr)
  return Number.isFinite(id) ? id : null
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  await ensureDb()
  const id = await parseId(req, ctx.params)
  if (id == null) return new Response('bad id', { status: 400 })
  const row = await db.selectFrom('posts').selectAll().where('id', '=', id).where('deleted_at', 'is', null).executeTakeFirst()
  if (!row) return new Response('not found', { status: 404 })
  const tagRows = await db
    .selectFrom('post_tags')
    .innerJoin('tags', 'tags.id', 'post_tags.tag_id')
    .select(['tags.name as name'])
    .where('post_tags.post_id', '=', id)
    .execute()
  await db
    .updateTable('posts')
    .set({ views: sql`views + 1`, updated_at: sql`now()` })
    .where('id', '=', id)
    .execute()
  return Response.json({
    id: Number(row.id),
    title: row.title,
    content: row.content,
    author: row.author,
    status: row.status,
    views: row.views + 1,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
    tags: tagRows.map((t) => t.name)
  })
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  await ensureDb()
  const id = await parseId(req, ctx.params)
  if (id == null) return new Response('bad id', { status: 400 })
  let title: string | undefined
  let content: string | undefined
  let tagsInput: string[] | undefined
  let status: number | undefined
  try {
    const body = await req.json()
    title = body?.title as string | undefined
    content = body?.content as string | undefined
    if (Array.isArray(body?.tags)) {
      tagsInput = body.tags.map((t: unknown) => String(t || '').trim()).filter(Boolean)
    }
    if (typeof body?.status === 'number') {
      status = body.status === 1 ? 1 : 0
    } else if (typeof body?.status === 'string') {
      const s = String(body.status).trim().toLowerCase()
      status = s === 'published' ? 1 : s === 'draft' ? 0 : undefined
    }
  } catch {
    return new Response(JSON.stringify({ error: 'bad_body' }), { status: 400 })
  }
  if (!title && !content && !tagsInput && !status) return new Response(JSON.stringify({ error: 'no_changes' }), { status: 400 })
  const q = db.updateTable('posts')
  const values: Partial<{ title: string; content: string; status: number }> = {}
  if (title) values.title = title
  if (content) values.content = content
  if (status) values.status = status
  const res = await q
    .set(values)
    .set('updated_at', sql`now()`)
    .where('id', '=', id)
    .executeTakeFirst()
  if (res.numUpdatedRows === BigInt(0)) return new Response('not found', { status: 404 })
  if (tagsInput) {
    await db.deleteFrom('post_tags').where('post_id', '=', id).execute()
    const uniqueNames = Array.from(new Set(tagsInput))
    const tagIds: number[] = []
    for (const name of uniqueNames) {
      const existing = await db
        .selectFrom('tags')
        .select('id')
        .where('name', '=', name)
        .executeTakeFirst()
      if (existing?.id != null) {
        tagIds.push(Number(existing.id))
      } else {
        const ins = await db
          .insertInto('tags')
          .values({ name })
          .executeTakeFirst()
        const rawNewId = (ins as unknown as { insertId?: unknown })?.insertId
        const newId = typeof rawNewId === 'bigint' ? Number(rawNewId) : Number(rawNewId)
        if (newId) tagIds.push(newId)
      }
    }
    if (tagIds.length) {
      await db.insertInto('post_tags').values(tagIds.map((tagId) => ({ post_id: id, tag_id: tagId }))).execute()
    }
  }
  return new Response(null, { status: 204 })
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  await ensureDb()
  const id = await parseId(req, ctx.params)
  if (id == null) return new Response('bad id', { status: 400 })
  const res = await db
    .updateTable('posts')
    .set({ deleted_at: sql`now()`, updated_at: sql`now()` })
    .where('id', '=', id)
    .executeTakeFirst()
  if (res.numUpdatedRows === BigInt(0)) return new Response('not found', { status: 404 })
  return new Response(null, { status: 204 })
}

