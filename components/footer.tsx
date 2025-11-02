"use client"

import React from "react"
import { Github } from "lucide-react"

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-emerald-500/20 bg-[#031a15]/80 backdrop-blur supports-[backdrop-filter]:bg-[#031a15]/60">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="https://github.com/Freya-Lee-Zou"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-emerald-200 hover:text-emerald-50"
          title="freyaZou"
        >
          <Github className="h-4 w-4" />
          freyaZou
        </a>
      </div>
    </footer>
  )
}
