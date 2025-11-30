"use client"
import { Button, ButtonGroup, HStack, Pagination, Text } from "@chakra-ui/react"
import { useRouter, useSearchParams } from "next/navigation"

export default function PaginationClient({ total, page, pageSize }: { total: number, page: number, pageSize: number }) {
  const router = useRouter()
  const sp = useSearchParams()
  const q = sp.get("q") || ""
  const tags = sp.getAll("tags")
  const maxPage = Math.max(1, Math.ceil(total / pageSize))

  const push = (nextPage: number, nextSize?: number) => {
    const p = Math.min(Math.max(1, nextPage), maxPage)
    const params = new URLSearchParams()
    params.set("page", String(p))
    params.set("pageSize", String(nextSize ?? pageSize))
    if (q.trim()) params.set("q", q.trim())
    tags.forEach((t) => params.append("tags", t))
    router.push(`/?${params.toString()}`)
  }

  return (
    <Pagination.Root count={total} page={page} pageSize={pageSize}>
      <ButtonGroup variant="outline" size="sm">
        <Button disabled={page <= 1} onClick={() => push(page - 1)}>上一页</Button>
        <Pagination.Context>
          {({ pages }) =>
            pages.map((p, i) =>
              p.type === 'page' ? (
                <Button key={i} variant={p.value === page ? 'solid' : 'outline'} onClick={() => push(p.value)}>
                  {p.value}
                </Button>
              ) : (
                <Text key={i}>…</Text>
              )
            )
          }
        </Pagination.Context>
        <Button disabled={page >= maxPage} onClick={() => push(page + 1)}>下一页</Button>
      </ButtonGroup>
      <HStack mt={3} gap={2}>
        {[10, 20, 50].map((sz) => (
          <Button key={sz} size="sm" variant={pageSize === sz ? 'solid' : 'outline'} onClick={() => push(1, sz)}>
            每页 {sz}
          </Button>
        ))}
      </HStack>
    </Pagination.Root>
  )
}

