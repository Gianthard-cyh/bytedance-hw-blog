import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ensureDb } from '@/lib/init'

export async function GET(_req: NextRequest) {
  await ensureDb()
  const rows = await db
    .selectFrom('tags')
    .innerJoin('post_tags', 'post_tags.tag_id', 'tags.id')
    .select(({ fn }) => [
      'tags.name as name',
      fn.count('post_tags.post_id').as('count')
    ])
    .groupBy('tags.name')
    .orderBy('count', 'desc')
    .execute()
  return Response.json(rows.map(r => ({ name: r.name as string, count: Number(r.count) })))
}
