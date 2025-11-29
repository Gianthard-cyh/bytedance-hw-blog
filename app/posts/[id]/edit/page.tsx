import { headers } from 'next/headers'
import EditForm from './EditForm'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!Number.isFinite(id)) return <main className="max-w-3xl mx-auto my-10 px-4 font-sans">ID 不合法</main>
  const h = await headers()
  const host = h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const base = `${proto}://${host}`
  const res = await fetch(`${base}/api/posts/${id}`, { cache: 'no-store' })
  if (!res.ok) return <main className="max-w-3xl mx-auto my-10 px-4 font-sans">加载失败</main>
  const data = await res.json() as { title: string; content: string; tags: string[] }
  return (
    <main className="max-w-3xl mx-auto my-10 px-4 font-sans">
      <h1 className="text-2xl md:text-3xl mb-4">编辑帖子</h1>
      <EditForm id={id} initial={{ title: data.title, content: data.content, tags: data.tags || [] }} />
    </main>
  )
}
