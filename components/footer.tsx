"use client"

import React from "react"
import { Github, Globe } from "lucide-react"

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-emerald-500/20 bg-[#031a15]/80 backdrop-blur supports-[backdrop-filter]:bg-[#031a15]/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 text-sm text-emerald-200/80 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Built by</span>
          <a
            href="https://www.freyazou.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-emerald-200 hover:text-emerald-50 hover:underline"
            title="Freya Zou Website"
          >
            <Globe className="h-4 w-4" />
            freyazou.com
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Freya-Lee-Zou"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-emerald-200 hover:text-emerald-50 hover:underline"
            title="GitHub: Freya-Lee-Zou"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}

