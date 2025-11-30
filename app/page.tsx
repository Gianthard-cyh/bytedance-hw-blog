import PostListServer from './components/PostListServer'
import SearchBar from './components/SearchBar'
import PaginationClient from './components/PaginationClient'
import TagFilterClient from './components/TagFilterClient'
import { headers } from 'next/headers'
import { Box, Heading, Button } from '@chakra-ui/react'
import NextLink from 'next/link'

export default async function Home({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = (await (searchParams ?? Promise.resolve({}))) as Record<string, string | string[] | undefined>
  const page = Number(sp.page ?? '1')
  const pageSize = Number(sp.pageSize ?? '10')
  const q = String(sp.q ?? '').trim()
  const tagsInput = sp.tags
  const selectedTags = Array.isArray(tagsInput)
    ? tagsInput.map((t) => String(t || '').trim()).filter(Boolean)
    : typeof tagsInput === 'string' && tagsInput
    ? [String(tagsInput).trim()]
    : []

  const h = await headers()
  const host = h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const base = `${proto}://${host}`

  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('pageSize', String(pageSize))
  if (q) params.set('q', q)
  selectedTags.forEach((t) => params.append('tags', t))
  const res = await fetch(`${base}/api/posts?${params.toString()}`, { cache: 'no-store' })
  if (!res.ok) return <main>加载失败</main>
  const data = await res.json() as {
    items: { id: number; title: string; content: string; author: string | null; views: number; created_at: string; tags: string[] }[]
    total: number
    page: number
    pageSize: number
  }

  return (
    <Box maxW="4xl" mx="auto" px={4} py={8}>
      <Heading as="h1" size="lg" mb={3}>文章列表</Heading>
      <Box mb={4}>
        <Button colorPalette="blue" asChild>
          <NextLink href="/posts/new">新建帖子</NextLink>
        </Button>
      </Box>
      <Box mb={3}>
        <SearchBar pageSize={data.pageSize} />
      </Box>
      <Box mb={3}>
        <TagFilterClient pageSize={data.pageSize} />
      </Box>
      <PostListServer items={data.items} />
      <Box mt={4}>
        <PaginationClient total={data.total} page={data.page} pageSize={data.pageSize} />
      </Box>
    </Box>
  )
}
