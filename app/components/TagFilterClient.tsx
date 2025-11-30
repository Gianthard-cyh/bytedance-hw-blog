"use client"
import { Button, HStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

type TagInfo = { name: string; count: number }

export default function TagFilterClient({ pageSize }: { pageSize: number }) {
  const router = useRouter()
  const sp = useSearchParams()
  const q = sp.get("q") || ""
  const selected = sp.getAll("tags")
  const [tags, setTags] = useState<TagInfo[]>([])

  useEffect(() => {
    let aborted = false
    fetch('/api/tags').then(r => r.json()).then((data: TagInfo[]) => {
      if (!aborted) setTags(data)
    }).catch(() => { })
    return () => { aborted = true }
  }, [])

  const pushTags = (nextTags: string[]) => {
    const params = new URLSearchParams()
    params.set("page", "1")
    params.set("pageSize", String(pageSize))
    if (q.trim()) params.set("q", q.trim())
    nextTags.forEach((t) => params.append("tags", t))
    router.push(`/?${params.toString()}`)
  }

  return (
    <HStack gap={2} wrap="wrap">
      {tags.map((t) => {
        const active = selected.includes(t.name)
        const nextTags = active ? selected.filter((x) => x !== t.name) : [...selected, t.name]
        return (
          <Button key={t.name} size="sm" variant={active ? 'solid' : 'outline'} onClick={() => pushTags(nextTags)}>
            {t.name}（{t.count}）
          </Button>
        )
      })}
      {selected.length > 0 && (
        <Button size="sm" variant="ghost" onClick={() => pushTags([])}>清除</Button>
      )}
    </HStack>
  )
}

