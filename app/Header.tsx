"use client"
import NextLink from "next/link"
import { Box, Flex, Text, Link as ChakraLink } from "@chakra-ui/react"
import { useEffect } from "react"
import { ColorModeButton, useColorMode } from "./components/ui/color-mode"

export default function Header() {
  const { colorMode } = useColorMode()
  useEffect(() => {
    try { document.documentElement.setAttribute("data-theme", colorMode) } catch {}
  }, [colorMode])
  return (
    <Box suppressHydrationWarning borderBottomWidth="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }}>
      <Box maxW="4xl" mx="auto" px={4} py={3}>
        <Flex align="center" justify="space-between" gap={4}>
          <ChakraLink asChild fontWeight="semibold" fontSize="lg">
            <NextLink href="/">博客</NextLink>
          </ChakraLink>
          <Flex align="center" gap={2}>
            <ColorModeButton />
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
}
