"use client"
import NextLink from 'next/link'
import { Box, Heading, Text, Link as ChakraLink } from '@chakra-ui/react'

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
      <ChakraLink color={{ base: 'blue.600', _dark: 'blue.300' }} mr={3} asChild>
        <NextLink href="/">← 返回列表</NextLink>
      </ChakraLink>
      <ChakraLink color={{ base: 'blue.600', _dark: 'blue.300' }} asChild>
        <NextLink href={`/posts/${data.id}/edit`}>编辑</NextLink>
      </ChakraLink>
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
