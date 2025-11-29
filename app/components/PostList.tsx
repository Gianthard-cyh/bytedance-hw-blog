"use client"
import NextLink from 'next/link'
import { Box, Heading, Flex, Text, Link as ChakraLink, Button, Input, HStack, IconButton, Pagination, ButtonGroup } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

export default function PostList() {
  const [items, setItems] = useState<{ id: number; title: string; content: string; author: string | null; views: number; created_at: string; tags: string[] }[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [q, setQ] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tags, setTags] = useState<{ name: string; count: number }[]>([])

  useEffect(() => {
    let aborted = false
    const url = new URL('/api/posts', window.location.origin)
    url.searchParams.set('page', String(page))
    url.searchParams.set('pageSize', String(pageSize))
    if (q.trim()) url.searchParams.set('q', q.trim())
    selectedTags.forEach((t) => url.searchParams.append('tags', t))
    fetch(url.toString())
      .then((r) => r.json())
      .then((data) => {
        if (aborted) return
        setItems(data.items)
        setTotal(data.total)
      })
      .catch(() => { })
    return () => { aborted = true }
  }, [page, pageSize, q, selectedTags])

  useEffect(() => {
    fetch('/api/tags').then(r => r.json()).then(setTags).catch(() => { })
  }, [])

  const maxPage = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])

  return (
    <Box maxW="3xl" mx="auto" px={4} py={10}>
      <Heading as="h1" size="lg" mb={3}>文章列表</Heading>
      <Box mb={4}>
        <Button colorPalette="blue" asChild>
          <NextLink href="/posts/new">新建帖子</NextLink>
        </Button>
      </Box>

      <HStack mb={3} gap={3} align="center" flexWrap="wrap">
        <Input placeholder="搜索标题" value={q} onChange={(e) => { setPage(1); setQ(e.target.value) }} maxW="250px" />
        <HStack gap={2}>
          {tags.map((t) => {
            const active = selectedTags.includes(t.name)
            return (
              <Button
                key={t.name}
                size="sm"
                variant={active ? 'solid' : 'outline'}
                onClick={() => {
                  setPage(1)
                  setSelectedTags((prev) => {
                    if (active) return prev.filter((x) => x !== t.name)
                    return [...prev, t.name]
                  })
                }}
              >
                {t.name}（{t.count}）
              </Button>
            )
          })}
          {tags.length > 0 && (
            <Button size="sm" variant="ghost" onClick={() => { setPage(1); setSelectedTags([]) }}>清除</Button>
          )}
        </HStack>
      </HStack>

      <Box>
        <Box mb={3}>
          <Pagination.Root
            count={total}
            page={page}
            pageSize={pageSize}
            onPageChange={(d) => setPage(d.page)}
            onPageSizeChange={(d) => { setPage(1); setPageSize(d.pageSize) }}
          >
            <HStack>
              <Pagination.PrevTrigger />
              <Pagination.Context>
                {({ pages }) =>
                  pages.map((p, i) =>
                    p.type === 'page' ? (
                      <Pagination.Item key={i} {...p} />
                    ) : (
                      <Pagination.Ellipsis key={i} index={i} />
                    )
                  )
                }
              </Pagination.Context>
              <Pagination.NextTrigger />
            </HStack>
          </Pagination.Root>
        </Box>
        {items.map((p) => {
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

      <Box mt={4}>
        <Pagination.Root count={total} pageSize={pageSize} defaultPage={1} onPageChange={(d) => setPage(d.page)}>
          <ButtonGroup variant="outline" size="sm">
            <Pagination.PrevTrigger asChild>
              <IconButton>
                <LuChevronLeft />
              </IconButton>
            </Pagination.PrevTrigger>

            <Pagination.Items
              render={(page) => (
                <IconButton variant={{ base: "outline", _selected: "solid" }}>
                  {page.value}
                </IconButton>
              )}
            />

            <Pagination.NextTrigger asChild>
              <IconButton>
                <LuChevronRight />
              </IconButton>
            </Pagination.NextTrigger>
          </ButtonGroup>
        </Pagination.Root>
      </Box>
    </Box>
  )
}
