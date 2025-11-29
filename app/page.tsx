import NextLink from 'next/link'
import { headers } from 'next/headers'
import { Box, Heading, Flex, Text, Link as ChakraLink, Button } from '@chakra-ui/react'


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
  return (
    <Box maxW="3xl" mx="auto" px={4} py={10} fontFamily="sans-serif">
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
            <Box key={p.id} py={4} borderBottomWidth="1px" borderColor="gray.200">
              <Flex justify="space-between" gap={3}>
                <ChakraLink color="blue.600" fontWeight="semibold" asChild>
                  <NextLink href={`/posts/${p.id}`}>{p.title}</NextLink>
                </ChakraLink>
                <Text color="gray.600">{formatDate(new Date(p.created_at))}</Text>
              </Flex>
              <Text color="gray.700" mt={1.5}>{excerpt}</Text>
              <Flex mt={2} align="center" gap={3} color="gray.500">
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
