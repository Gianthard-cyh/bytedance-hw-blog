"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Heading, Input, Textarea, Button, Text, TagsInput, Switch, HStack } from '@chakra-ui/react'
import PageContainer from '@/app/components/PageContainer'
import { FormControl, FormLabel } from '@chakra-ui/form-control'

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [published, setPublished] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const tagsPayload = tags
    if (!title.trim() || !content.trim()) {
      setError('标题和内容不能为空')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), tags: tagsPayload, status: published ? 1 : 0 })
      })
      if (!res.ok) {
        const unknownData: unknown = await res.json().catch(() => ({}))
        let msg = '创建失败'
        if (unknownData && typeof unknownData === 'object' && 'error' in unknownData) {
          msg = String((unknownData as { error: unknown }).error || msg)
        }
        setError(msg)
        setLoading(false)
        return
      }
      const data = await res.json() as { id: number }
      router.push(`/posts/${data.id}`)
    } catch {
      setError('网络错误')
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <Heading as="h1" size="lg" mb={4}>新建帖子</Heading>
      {error && <Text mb={3} color={{ base: 'red.600', _dark: 'red.400' }}>{error}</Text>}
      <Box as="form" onSubmit={handleSubmit} p={5} borderWidth="1px" borderRadius="xl" boxShadow="sm" bg={{ base: 'white', _dark: 'gray.800' }}>
        <FormControl mb={4}>
          <FormLabel>标题</FormLabel>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="请输入标题" borderRadius="xl" />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>内容</FormLabel>
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="请输入内容" rows={10} borderRadius="xl" />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>标签</FormLabel>
          <TagsInput.Root value={tags} onValueChange={(d) => setTags(d.value)} size="md" addOnPaste delimiter="," >
            <TagsInput.Control>
              <TagsInput.Items />
              <TagsInput.Input placeholder="输入或粘贴标签，回车添加" />
            </TagsInput.Control>
          </TagsInput.Root>
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>状态</FormLabel>
          <HStack align="center" gap={3}>
            <Switch.Root checked={!published} onCheckedChange={(d) => setPublished(!d.checked)} >
              <Switch.HiddenInput />
              <Switch.Control />
              <Switch.Label>
                草稿 
              </Switch.Label>
            </Switch.Root>
          </HStack>
        </FormControl>
        <Button type="submit" colorPalette="blue" disabled={loading} borderRadius="xl">{loading ? '创建中…' : '创建'}</Button>
      </Box>
    </PageContainer>
  )
}
