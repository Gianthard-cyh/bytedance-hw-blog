"use client"
import NextLink from 'next/link'
import { Box, Heading, Text, Button, IconButton } from '@chakra-ui/react'
import { LuArrowLeft, LuEdit } from 'react-icons/lu'

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

export default function PostDetail({ data }: { data: { id: number; title: string; content: string; author: string | null; views: number; created_at: string; updated_at: string; tags: string[] } }) {
  const tags = data.tags
  return (
    <Box maxW="3xl" mx="auto" px={4} py={10}>
      <Box display="flex" gap={3} mb={3}>
        <Button asChild variant="outline" size="sm">
          <NextLink href="/"><LuArrowLeft style={{ marginRight: 6 }} /> 返回列表</NextLink>
        </Button>
        <IconButton asChild aria-label="编辑" variant="outline" size="sm">
          <NextLink href={`/posts/${data.id}/edit`}><LuEdit /></NextLink>
        </IconButton>
      </Box>
      <Heading as="h1" size="lg" mb={2}>{data.title}</Heading>
      <Text color={{ base: 'gray.600', _dark: 'gray.400' }} mb={3}>
        作者：{data.author || '匿名'}
        {' · '}发布时间：{formatDate(new Date(data.created_at))}
        {' · '}阅读：{data.views}
      </Text>
      <Text whiteSpace="pre-wrap" lineHeight="tall">{data.content}</Text>
      <Text mt={4} color={{ base: 'gray.500', _dark: 'gray.400' }}>标签：{tags.join('、') || '无'}</Text>
    </Box>
  )
}
