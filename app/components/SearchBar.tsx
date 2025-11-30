"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button, HStack, Input } from "@chakra-ui/react"

export default function SearchBar({ pageSize }: { pageSize: number }) {
  const router = useRouter()
  const sp = useSearchParams()
  const q = sp.get("q") || ""
  const tagsCsv = sp.get("tags") || ""
  const tags = tagsCsv
    ? tagsCsv.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  const submit = (nextQ: string) => {
    const params = new URLSearchParams()
    params.set("page", "1")
    params.set("pageSize", String(pageSize))
    if (nextQ.trim()) params.set("q", nextQ.trim())
    if (tags.length) params.set("tags", tags.join(','))
    router.push(`/?${params.toString()}`)
  }

  return (
    <HStack gap={2} align="center">
      <Input defaultValue={q} placeholder="搜索标题" maxW="250px" onKeyDown={(e) => {
        if (e.key === "Enter") submit((e.target as HTMLInputElement).value)
      }} />
      <Button size="sm" variant="outline" onClick={() => submit((document.querySelector('input[placeholder="搜索标题"]') as HTMLInputElement)?.value || "")}>搜索</Button>
    </HStack>
  )
}

