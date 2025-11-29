"use client"
import NextLink from 'next/link'
import { Box, Heading, Flex, Text, Link as ChakraLink, Button } from '@chakra-ui/react'

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

export default function PostList({ rows }: { rows: { id: number; title: string; content: string; author: string | null; views: number; created_at: string; tags: string[] }[] }) {
  return (
    <Box maxW="3xl" mx="auto" px={4} py={10}>
      <Heading as="h1" size="lg" mb={3}>文章列表</Heading>
      <Box mb={4}>
        <Button colorPalette="blue" asChild>
          <NextLink href="/posts/new">新建帖子</NextLink>
        </Button>
      </Box>
      <Box>
        {rows.map((p) => {
          const excerpt = p.content.length > 120 ? p.content.slice(0, 120) + '…' : p.content
          const tags = p.tags
          return (
            <Box key={p.id} py={4} borderBottomWidth="1px" borderColor="gray.200" _dark={{ borderColor: 'gray.700' }}>
              <Flex justify="space-between" gap={3}>
                <ChakraLink color={{ base: 'blue.600', _dark: 'blue.300' }} fontWeight="semibold" asChild>
                  <NextLink href={`/posts/${p.id}`}>{p.title}</NextLink>
                </ChakraLink>
                <Text color={{ base: 'gray.600', _dark: 'gray.400' }}>{formatDate(new Date(p.created_at))}</Text>
              </Flex>
              <Text color={{ base: 'gray.700', _dark: 'gray.200' }} mt={1.5}>{excerpt}</Text>
              <Flex mt={2} align="center" gap={3} color={{ base: 'gray.500', _dark: 'gray.400' }}>
                <Text>作者：{p.author || '匿名'}</Text>
                <Text>阅读：{p.views}</Text>
                <Text>标签：{tags.join('、') || '无'}</Text>
              </Flex>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
