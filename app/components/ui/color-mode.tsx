"use client"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { ClientOnly, IconButton, Skeleton } from "@chakra-ui/react"
import { LuMoon, LuSun } from "react-icons/lu"

type Mode = "light" | "dark"

const Ctx = createContext<{
  colorMode: Mode
  setColorMode: (m: Mode) => void
  toggleColorMode: () => void
} | null>(null)

export function ColorModeProvider(props: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return "light"
    const saved = localStorage.getItem("theme")
    if (saved === "light" || saved === "dark") return saved
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches
    return prefersDark ? "dark" : "light"
  })
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(mode)
    root.setAttribute("data-theme", mode)
    try { localStorage.setItem("theme", mode) } catch {}
  }, [mode])
  const value = useMemo(() => ({
    colorMode: mode,
    setColorMode: (m: Mode) => setMode(m),
    toggleColorMode: () => setMode((p) => (p === "dark" ? "light" : "dark")),
  }), [mode])
  return <Ctx.Provider value={value}>{props.children}</Ctx.Provider>
}

export function useColorMode() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("ColorModeProvider missing")
  return ctx
}

export function useColorModeValue<T>(light: T, dark: T): T {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? dark : light
}

export function ColorModeButton() {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <ClientOnly fallback={<Skeleton boxSize="8" />}>
      <IconButton aria-label="切换颜色模式" onClick={toggleColorMode} variant="outline" size="sm">
        {colorMode === "light" ? <LuSun /> : <LuMoon />}
      </IconButton>
    </ClientOnly>
  )
}

export function LightMode({ children }: { children: React.ReactNode }) {
  return <div className="light">{children}</div>
}

export function DarkMode({ children }: { children: React.ReactNode }) {
  return <div className="dark">{children}</div>
}
