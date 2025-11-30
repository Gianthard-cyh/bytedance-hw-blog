import { headers } from 'next/headers'
import PostDetail from '@/app/components/PostDetail'
import type { PostDetail as PostDetailType } from '@/types/post'

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!Number.isFinite(id)) return <main>bad id</main>
  const h = await headers()
  const host = h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const base = `${proto}://${host}`
  const res = await fetch(`${base}/api/posts/${id}`, { cache: 'no-store' })
  if (!res.ok) return <main>not found</main>
  const data = await res.json() as PostDetailType
  return <PostDetail data={data} />
}
