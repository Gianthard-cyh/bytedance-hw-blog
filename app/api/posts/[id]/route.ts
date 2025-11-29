import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ensureDb } from '@/lib/init'
import { sql } from 'kysely'

type Params = { params?: { id?: string } }

function parseId(req: NextRequest, params?: { id?: string }) {
  const idStr = params?.id ?? new URL(req.url).pathname.split('/').pop()
  const id = Number(idStr)
  return Number.isFinite(id) ? id : null
}

export async function GET(req: NextRequest, ctx: Params) {
  await ensureDb()
  const id = parseId(req, ctx.params)
  if (id == null) return new Response('bad id', { status: 400 })
  const row = await db.selectFrom('posts').selectAll().where('id', '=', id).executeTakeFirst()
  if (!row) return new Response('not found', { status: 404 })
  const tagRows = await db
    .selectFrom('post_tags')
    .innerJoin('tags', 'tags.id', 'post_tags.tag_id')
    .select(['tags.name as name'])
    .where('post_tags.post_id', '=', id)
    .execute()
  return Response.json({
    id: row.id,
    title: row.title,
    content: row.content,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
    tags: tagRows.map((t) => t.name)
  })
}

export async function PUT(req: NextRequest, ctx: Params) {
  await ensureDb()
  const id = parseId(req, ctx.params)
  if (id == null) return new Response('bad id', { status: 400 })
  let title: string | undefined
  let content: string | undefined
  let tagsInput: string[] | undefined
  try {
    const body = await req.json()
    title = body?.title as string | undefined
    content = body?.content as string | undefined
    if (Array.isArray(body?.tags)) {
      tagsInput = body.tags.map((t: unknown) => String(t || '').trim()).filter(Boolean)
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: 'bad_body' }), { status: 400 })
  }
  if (!title && !content && !tagsInput) return new Response(JSON.stringify({ error: 'no_changes' }), { status: 400 })
  const q = db.updateTable('posts')
  const values: Partial<{ title: string; content: string }> = {}
  if (title) values.title = title
  if (content) values.content = content
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
      const up = await db
        .insertInto('tags')
        .values({ name })
        .onConflict((oc) => oc.column('name').doUpdateSet({ name }))
        .returning('id')
        .executeTakeFirst()
      if (up?.id) tagIds.push(up.id)
    }
    if (tagIds.length) {
      await db.insertInto('post_tags').values(tagIds.map((tagId) => ({ post_id: id, tag_id: tagId }))).execute()
    }
  }
  return new Response(null, { status: 204 })
}

export async function DELETE(req: NextRequest, ctx: Params) {
  await ensureDb()
  const id = parseId(req, ctx.params)
  if (id == null) return new Response('bad id', { status: 400 })
  const res = await db.deleteFrom('posts').where('id', '=', id).executeTakeFirst()
  if (res.numDeletedRows === BigInt(0)) return new Response('not found', { status: 404 })
  return new Response(null, { status: 204 })
}

