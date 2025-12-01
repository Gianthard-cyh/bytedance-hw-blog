"use client"
import { ChakraProvider, defaultSystem, ClientOnly } from "@chakra-ui/react"
import Header from "./Header"
import { ColorModeProvider } from "./components/ui/color-mode"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ChakraProvider value={defaultSystem}>
        <ColorModeProvider>
            <Header />
          {children}
        </ColorModeProvider>
      </ChakraProvider>
    </div>
  )
}
