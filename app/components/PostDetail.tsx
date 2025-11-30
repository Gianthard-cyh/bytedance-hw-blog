"use client"
import NextLink from 'next/link'
import { Box, Heading, Text, Button, IconButton } from '@chakra-ui/react'
import PageContainer from './PageContainer'
import { LuArrowLeft, LuPencil } from 'react-icons/lu'
import { useRouter } from 'next/navigation'
import type { PostDetail as PostDetailType } from '@/types/post'

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

export default function PostDetail({ data }: { data: PostDetailType }) {
  const router = useRouter()
  const tags = data.tags
  return (
    <PageContainer>
      <Box display="flex" gap={3} mb={3}>
        <Button asChild variant="outline" size="sm">
          <NextLink href="/"><LuArrowLeft style={{ marginRight: 6 }} /> 返回列表</NextLink>
        </Button>
        <IconButton asChild aria-label="编辑" variant="outline" size="sm">
          <NextLink href={`/posts/${data.id}/edit`}><LuPencil /></NextLink>
        </IconButton>
        <Button size="sm" onClick={async () => {
          const next = data.status === 1 ? 0 : 1
          await fetch(`/api/posts/${data.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
          router.refresh()
        }}>{data.status === 1 ? '设为草稿' : '发布'}</Button>
        <Button size="sm" variant="outline" colorPalette="red" onClick={async () => {
          await fetch(`/api/posts/${data.id}`, { method: 'DELETE' })
          router.push('/')
        }}>删除</Button>
      </Box>
      <Box p={5} borderWidth="1px" borderRadius="xl" boxShadow="sm" bg={{ base: 'white', _dark: 'gray.800' }}>
        <Heading as="h1" size="lg" mb={2}>{data.title}</Heading>
        <Text color={{ base: 'gray.600', _dark: 'gray.400' }} mb={3}>
          作者：{data.author || '匿名'}
          {' · '}发布时间：{formatDate(new Date(data.created_at))}
          {' · '}阅读：{data.views}
          {' · '}{data.status === 1 ? '已发布' : '草稿'}
        </Text>
        <Text whiteSpace="pre-wrap" lineHeight="tall">{data.content}</Text>
        <Text mt={4} color={{ base: 'gray.500', _dark: 'gray.400' }}>标签：{tags.join('、') || '无'}</Text>
      </Box>
    </PageContainer>
  )
}
