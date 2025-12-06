"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Central theme provider configuring next-themes to toggle the `.dark` class
// which matches the custom variant declared in globals.css: `@custom-variant dark (&:is(.dark *));`
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"          // ensure a `dark` class is applied to <html>
      defaultTheme="system"      // use system preference first
      enableSystem                // allow system theme switching
      disableTransitionOnChange   // avoid flicker on toggle
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}