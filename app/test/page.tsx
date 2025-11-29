"use client"
import { useState } from 'react'

type Post = { id: number; title: string; content: string; created_at: string }

export default function Page() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    setRefreshing(true)
    const res = await fetch('/api/posts')
    const data = await res.json()
    setPosts(data)
    setRefreshing(false)
  }

  const add = async () => {
    setLoading(true)
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hello', content: 'World' })
    })
    await load()
    setLoading(false)
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Posts</h1>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={add} disabled={loading}>
          {loading ? 'Creating…' : 'Create Sample Post'}
        </button>
        <button onClick={load} disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <strong>{p.title}</strong> — {p.content} — {p.created_at}
          </li>
        ))}
      </ul>
    </div>
  )
}

