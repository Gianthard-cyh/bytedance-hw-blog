import { headers } from 'next/headers'
import PostList from './components/PostList'


const formatDate = (d: Date) => {
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
  return <PostList rows={rows} />
}
