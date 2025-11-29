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

export default async function Home() {
  const h = await headers()
  const host = h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const base = `${proto}://${host}`
  const res = await fetch(`${base}/api/posts?page=1&pageSize=20`, { cache: 'no-store' })
  const data = await res.json() as { items: { id: number; title: string; content: string; author: string | null; views: number; created_at: string; updated_at: string; tags: string[] }[] }
  const rows = data.items
  return (
    <main className="max-w-3xl mx-auto my-10 px-4 font-sans">
      <h1 className="text-2xl md:text-3xl mb-3">文章列表</h1>
      <ul className="list-none p-0 m-0">
        {rows.map((p) => {
          const excerpt = p.content.length > 120 ? p.content.slice(0, 120) + '…' : p.content
          const tags = p.tags
          return (
            <li key={p.id} className="py-4 border-b border-gray-200">
              <div className="flex justify-between gap-3">
                <Link href={`/posts/${p.id}`} className="text-lg font-semibold text-blue-600 hover:underline">
                  {p.title}
                </Link>
                <span className="text-gray-600">{formatDate(new Date(p.created_at))}</span>
              </div>
              <div className="text-gray-700 mt-1.5">{excerpt}</div>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-gray-500">作者：{p.author || '匿名'}</span>
                <span className="text-gray-500">阅读：{p.views}</span>
                <span className="text-gray-500">标签：{tags.join('、') || '无'}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
