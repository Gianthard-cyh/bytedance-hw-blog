import NextLink from 'next/link'
import { Box, Heading, Flex, Text, Link as ChakraLink, HStack, Tag } from '@chakra-ui/react'
import type { PostListItem } from '@/types/post'

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

export default function PostListServer({ items }: { items: PostListItem[] }) {
  return (
    <Box>
      {items.map((p) => {
        const excerpt = p.content.length > 120 ? p.content.slice(0, 120) + '…' : p.content
        const tags = p.tags
        return (
          <Box key={p.id} mb={4} p={4} borderWidth="1px" borderRadius="xl" boxShadow="sm" bg={{ base: 'white', _dark: 'gray.800' }}>
            <Flex justify="space-between" gap={3}>
              <ChakraLink color={{ base: 'blue.600', _dark: 'blue.300' }} fontWeight="semibold" asChild>
                <NextLink href={`/posts/${p.id}`}>{p.title}</NextLink>
              </ChakraLink>
              <Text color={{ base: 'gray.600', _dark: 'gray.400' }}>{formatDate(new Date(p.created_at))}</Text>
            </Flex>
            <Text color={{ base: 'gray.700', _dark: 'gray.200' }} mt={1.5}>{excerpt}</Text>
            <HStack mt={2} gap={2} color={{ base: 'gray.500', _dark: 'gray.400' }} flexWrap="wrap">
              <Tag.Root variant="solid" size="sm" colorPalette={p.status === 1 ? 'green' : 'gray'}>
                <Tag.Label>{p.status === 1 ? '已发布' : '草稿'}</Tag.Label>
              </Tag.Root>
              <Text>作者：{p.author || '匿名'}</Text>
              <Text>阅读：{p.views}</Text>
              {tags.length > 0 ? (
                <HStack gap={2}>
                  {tags.map((t, i) => (
                    <Tag.Root key={i} variant="solid" size="sm" colorPalette="blue">
                      <Tag.Label>{t}</Tag.Label>
                    </Tag.Root>
                  ))}
                </HStack>
              ) : (
                <Text>标签：无</Text>
              )}
            </HStack>
          </Box>
        )
      })}
    </Box>
  )
}
