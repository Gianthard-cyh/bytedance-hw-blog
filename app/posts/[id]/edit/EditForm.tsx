"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditForm({ id, initial }: { id: number; initial: { title: string; content: string; tags: string[] } }) {
  const router = useRouter()
  const [title, setTitle] = useState(initial.title)
  const [content, setContent] = useState(initial.content)
  const [tagsInput, setTagsInput] = useState((initial.tags || []).join(', '))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (!title.trim() && !content.trim() && tags.length === 0) {
      setError('没有任何修改')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() || undefined, content: content.trim() || undefined, tags })
      })
      if (!res.ok) {
        const unknownData: unknown = await res.json().catch(() => ({}))
        let msg = '更新失败'
        if (unknownData && typeof unknownData === 'object' && 'error' in unknownData) {
          msg = String((unknownData as { error: unknown }).error || msg)
        }
        setError(msg)
        setLoading(false)
        return
      }
      router.push(`/posts/${id}`)
    } catch {
      setError('网络错误')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-700 mb-1">标题</label>
        <input
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入标题"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">内容</label>
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2 h-48 leading-relaxed focus:outline-none focus:ring focus:ring-blue-200"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请输入内容"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">标签（逗号分隔）</label>
        <input
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="如：前端, Kysely, PostgreSQL"
        />
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? '保存中…' : '保存修改'}
        </button>
      </div>
    </form>
  )
}

