import { headers } from 'next/headers'
import EditForm from './EditForm'
import { Box, Heading } from '@chakra-ui/react'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!Number.isFinite(id)) return <Box maxW="4xl" mx="auto" px={4} py={8}>ID 不合法</Box>
  const h = await headers()
  const host = h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const base = `${proto}://${host}`
  const res = await fetch(`${base}/api/posts/${id}`, { cache: 'no-store' })
  if (!res.ok) return <Box maxW="4xl" mx="auto" px={4} py={8}>加载失败</Box>
  const data = await res.json() as { title: string; content: string; tags: string[] }
  return (
    <Box maxW="4xl" mx="auto" px={4} py={8}>
      <Heading as="h1" size="lg" mb={4}>编辑帖子</Heading>
      <EditForm id={id} initial={{ title: data.title, content: data.content, tags: data.tags || [] }} />
    </Box>
  )
}
