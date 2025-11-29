import Link from 'next/link'
import { headers } from 'next/headers'

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
  const data = await res.json() as { id: number; title: string; content: string; author: string | null; views: number; created_at: string; updated_at: string; tags: string[] }
  const tags = data.tags
  return (
    <main className="max-w-3xl mx-auto my-10 px-4 font-sans">
      <Link href="/" className="inline-block mb-3 text-blue-600 hover:underline">← 返回列表</Link>
      <h1 className="text-2xl md:text-3xl mb-2">{data.title}</h1>
      <div className="text-gray-600 mb-3 space-x-3">
        <span>作者：{data.author || '匿名'}</span>
        <span>发布时间：{formatDate(new Date(data.created_at))}</span>
        <span>阅读：{data.views}</span>
      </div>
      <div className="whitespace-pre-wrap leading-relaxed">{data.content}</div>
      <div className="mt-4 text-gray-500">标签：{tags.join('、') || '无'}</div>
    </main>
  )
}
