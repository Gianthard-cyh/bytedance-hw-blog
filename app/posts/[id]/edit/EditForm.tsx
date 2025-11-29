"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Textarea, Button, Text } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/form-control'

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
    <form onSubmit={handleSubmit}>
      <FormControl mb={4}>
        <FormLabel>标题</FormLabel>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="请输入标题" />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>内容</FormLabel>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="请输入内容" rows={10} />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>标签（逗号分隔）</FormLabel>
        <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="如：前端, Kysely, PostgreSQL" />
      </FormControl>
      {error && <Text color="red.600">{error}</Text>}
      <Button type="submit" colorPalette="blue" disabled={loading}>{loading ? '保存中…' : '保存修改'}</Button>
    </form>
  )
}
