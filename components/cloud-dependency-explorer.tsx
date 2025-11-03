"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { companies as defaultCompanies, type Company } from "../lib/company-data"
import { Search, Plus, Loader2, X } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Treemap, Tooltip, Legend } from "recharts"

interface CloudDependencyExplorerProps {
  onOpenRegions?: () => void
}

export function CloudDependencyExplorer({ onOpenRegions }: CloudDependencyExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [customCompanies, setCustomCompanies] = useState<Company[]>([])
  const [newCompanyUrl, setNewCompanyUrl] = useState("")
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionError, setDetectionError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  // Combine default and custom companies
  const allCompanies = useMemo(() => {
    return [...defaultCompanies, ...customCompanies]
  }, [customCompanies])

  const filteredCompanies = useMemo(() => {
    return allCompanies.filter((company) => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesProvider = !selectedProvider || company.provider === selectedProvider
      return matchesSearch && matchesProvider
    })
  }, [allCompanies, searchQuery, selectedProvider])

  const providerCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allCompanies.forEach((company) => {
      counts[company.provider] = (counts[company.provider] || 0) + 1
    })
    return counts
  }, [allCompanies])

  const handleAddCompany = async () => {
    if (!newCompanyUrl.trim()) return

    setIsDetecting(true)
    setDetectionError(null)

    try {
      // Extract domain from URL
      let domain = newCompanyUrl.trim()
      if (domain.startsWith("http://") || domain.startsWith("https://")) {
        domain = new URL(domain).hostname
      }
      domain = domain.replace("www.", "")

      // Check if company already exists
      if (allCompanies.some((c) => c.domain === domain)) {
        setDetectionError("Company already exists")
        setIsDetecting(false)
        return
      }

      // Call detection API
      const response = await fetch("/api/detect-cloud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newCompanyUrl.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to detect cloud provider")
      }

      const result = await response.json()

      // Extract company name from domain
      const name = domain.split(".")[0]
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1)

      // Add new company
      const newCompany: Company = {
        name: formattedName,
        symbol: "CUSTOM",
        domain,
        provider: result.provider,
      }

      setCustomCompanies((prev) => [...prev, newCompany])
      setNewCompanyUrl("")
    } catch (error) {
      console.error("[v0] Error adding company:", error)
      setDetectionError("Failed to detect cloud provider. Please try again.")
    } finally {
      setIsDetecting(false)
    }
  }

  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null)

  const COLORS = {
    AWS: "#ff9900",
    Azure: "#0089d6",
    GCP: "#4285f4",
    Oracle: "#f80000",
    Alibaba: "#ff6a00",
    Other: "#6b7280",
  }

  const PROVIDER_LOGOS = {
    AWS: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
    Azure: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg",
    GCP: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg",
    Oracle: "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg",
    Alibaba: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Alibaba_Cloud_logo.png",
  }

  const PROVIDER_DISPLAY_NAMES = {
    AWS: "AWS",
    Azure: "Azure",
    GCP: "Google Cloud",
    Oracle: "Oracle",
    Alibaba: "Alibaba Cloud",
    Other: "Other",
  }

  const pieData = useMemo(() => {
    return Object.entries(providerCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        color: COLORS[name as keyof typeof COLORS] || COLORS.Other,
      }))
  }, [providerCounts])

  const displayedCompanies = useMemo(() => {
    if (hoveredProvider) {
      return allCompanies.filter((c) => c.provider === hoveredProvider)
    }
    return filteredCompanies
  }, [hoveredProvider, filteredCompanies, allCompanies])

  const handleSearch = async (value: string) => {
    setSearchQuery(value)
    
    // If it looks like a URL or domain, try to add it
    if (value.includes('.') && value.length > 3 && !allCompanies.some(c => c.name.toLowerCase().includes(value.toLowerCase()))) {
      // Auto-trigger detection after short delay
      const timer = setTimeout(() => {
        setNewCompanyUrl(value)
      }, 500)
      return () => clearTimeout(timer)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#010b13] text-emerald-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-12 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl sm:-left-20 sm:h-96 sm:w-96" />
        <div className="absolute right-[-10%] top-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute inset-x-[-30%] bottom-[-40%] h-[36rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(8,56,40,0.35),_transparent_70%)] blur-2xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative mb-6 px-4 pt-12 text-center sm:pt-16">
          {onOpenRegions && (
            <div ref={menuRef} className="absolute right-4 top-2 z-20 sm:right-8 sm:top-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenRegions?.()}
                  className="flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 font-semibold text-emerald-100 transition-all hover:-translate-y-0.5 hover:border-emerald-400/70 hover:bg-emerald-500/25 hover:text-emerald-50 hover:shadow-[0_15px_35px_rgba(57,255,159,0.25)] sm:px-4"
                  title="Explore Cloud Regions"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">Cloud Regions</span>
                  <span className="sm:hidden">Regions</span>
                </button>
                <button
                  aria-label="Choose cloud provider"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="rounded-lg border border-emerald-400/40 bg-emerald-500/15 p-2 text-emerald-100 transition-colors hover:border-emerald-400/70 hover:bg-emerald-500/25"
                >
                  <svg className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.127l3.71-3.896a.75.75 0 111.08 1.04l-4.24 4.46a.75.75 0 01-1.08 0l-4.24-4.46a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              {menuOpen && (
                <div className="mt-2 min-w-[200px] rounded-lg border border-emerald-500/30 bg-[#031a15]/95 p-1 text-sm text-emerald-100 shadow-2xl">
                  {[
                    { label: 'AWS', key: 'aws', enabled: true },
                    { label: 'Azure', key: 'azure', enabled: false },
                    { label: 'Google Cloud', key: 'gcp', enabled: false },
                    { label: 'Oracle', key: 'oracle', enabled: false },
                    { label: 'Alibaba', key: 'alibaba', enabled: false },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        setMenuOpen(false)
                        if (item.enabled) onOpenRegions?.()
                      }}
                      disabled={!item.enabled}
                      className={`w-full text-left rounded-md px-3 py-2 transition-colors ${
                        item.enabled
                          ? 'hover:bg-emerald-500/15 hover:text-emerald-50'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {item.label}{!item.enabled && ' • coming soon'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <h1 className="mb-3 break-words text-4xl font-black tracking-tight text-emerald-100 sm:text-5xl lg:text-6xl">
            Who Controls <span className="text-[#39ff9f]">The Internet?</span>
          </h1>
          <p className="px-2 text-base text-emerald-200/80 sm:text-lg">
            When AWS goes down, Netflix, Reddit, and Slack go with it.
          </p>
        </div>

        {/* Single Search Bar */}
        <div className="mx-auto mb-6 max-w-2xl px-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-emerald-400/80" />
            <Input
              type="text"
              placeholder="Search companies or add new ones (e.g., 'Netflix' or 'stripe.com')..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.includes('.')) {
                  setNewCompanyUrl(searchQuery)
                  handleAddCompany()
                }
              }}
              className="h-14 rounded-xl border-2 border-emerald-500/25 bg-[#041612]/90 pl-12 pr-12 text-lg text-emerald-100 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-all placeholder:text-emerald-200/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedProvider(null)
                }}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-emerald-500/15"
                aria-label="Clear search"
              >
                <X className="h-5 w-5 text-emerald-300 hover:text-emerald-100" />
              </button>
            )}
          </div>
          {detectionError && (
            <div className="mt-2 text-center text-sm text-red-400">{detectionError}</div>
          )}
        </div>

        {/* Provider Filter Pills with LOGOS */}
        <div className="mb-8 flex flex-wrap justify-center gap-3 px-4">
          {Object.entries(providerCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([provider, count]) => {
              const isSelected = selectedProvider === provider
              const logo = PROVIDER_LOGOS[provider as keyof typeof PROVIDER_LOGOS]
              const displayName = PROVIDER_DISPLAY_NAMES[provider as keyof typeof PROVIDER_DISPLAY_NAMES] || provider
              const color = COLORS[provider as keyof typeof COLORS] || COLORS.Other
              return (
                <button
                  key={provider}
                  className={`relative flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 font-semibold transition-all ${
                    isSelected
                      ? "scale-[1.03] shadow-[0_18px_45px_rgba(0,0,0,0.55)]"
                      : "hover:scale-[1.02] hover:shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
                  }`}
                  style={{
                    backgroundColor: isSelected ? color : "rgba(4, 22, 18, 0.94)",
                    borderColor: color,
                    color: isSelected ? "#02110b" : color,
                    boxShadow: isSelected ? `0 0 32px ${color}55` : undefined,
                  }}
                  onClick={() => setSelectedProvider(isSelected ? null : provider)}
                  onMouseEnter={() => setHoveredProvider(provider)}
                  onMouseLeave={() => setHoveredProvider(null)}
                  aria-pressed={isSelected}
                  title={`Filter by ${displayName}`}
                >
                  {logo && (
                    <img 
                      src={logo} 
                      alt={provider} 
                      className="h-5 w-auto flex-shrink-0" 
                      style={{ filter: isSelected ? "brightness(0) invert(1)" : "drop-shadow(0 0 6px rgba(57,255,159,0.35))" }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  <span className="text-sm whitespace-nowrap">{displayName}</span>
                  <span className="text-xs opacity-75 whitespace-nowrap">({count})</span>
                  {isSelected && (
                    <X 
                      className="ml-1 h-4 w-4 text-[#02110b]/80 opacity-90 hover:opacity-100" 
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedProvider(null)
                      }}
                    />
                  )}
                </button>
              )
            })}
        </div>

        {/* Main Visualization */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pie Chart with Hover */}
          <div className="rounded-2xl border border-emerald-500/20 bg-[#031a15]/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-sm">
            <h2 className="mb-4 text-center text-2xl font-bold text-emerald-50">Cloud Provider Market Share</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    const displayName = PROVIDER_DISPLAY_NAMES[name as keyof typeof PROVIDER_DISPLAY_NAMES] || name
                    return `${displayName} ${(percent * 100).toFixed(0)}%`
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  onMouseEnter={(data) => setHoveredProvider(data.name)}
                  onMouseLeave={() => setHoveredProvider(null)}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      onClick={() => setSelectedProvider(selectedProvider === entry.name ? null : entry.name)}
                      style={{ cursor: "pointer" }}
                      opacity={
                        hoveredProvider 
                          ? hoveredProvider === entry.name ? 1 : 0.3
                          : selectedProvider && selectedProvider !== entry.name ? 0.3 : 1
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#041a14",
                    border: "1px solid rgba(57,255,159,0.35)",
                    borderRadius: 12,
                    color: "#e6ffe9",
                    boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
                  }}
                  itemStyle={{ color: "#e6ffe9" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <div className="text-6xl font-black text-[#39ff9f]">
                {Math.round(((providerCounts["AWS"] || 0) + (providerCounts["Azure"] || 0) + (providerCounts["GCP"] || 0)) / allCompanies.length * 100)}%
              </div>
              <div className="text-sm font-medium text-emerald-200/70">The Big 3 Control Everything</div>
            </div>
          </div>

          {/* All Company Logos - Scrollable */}
          <div className="rounded-2xl border border-emerald-500/20 bg-[#031a15]/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-emerald-50 sm:text-2xl">
                {hoveredProvider || selectedProvider 
                  ? `${PROVIDER_DISPLAY_NAMES[(hoveredProvider || selectedProvider) as keyof typeof PROVIDER_DISPLAY_NAMES] || (hoveredProvider || selectedProvider)} Companies` 
                  : "All Companies"} ({displayedCompanies.length})
              </h2>
              {(selectedProvider || hoveredProvider) && (
                <button 
                  onClick={() => {
                    setSelectedProvider(null)
                    setHoveredProvider(null)
                  }} 
                  className="flex items-center gap-1 rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-100 transition-all hover:border-emerald-400/70 hover:bg-emerald-500/25 hover:text-emerald-50 hover:shadow-[0_15px_35px_rgba(57,255,159,0.25)]"
                >
                  <X className="h-3 w-3" />
                  Clear Filter
                </button>
              )}
            </div>
            <div className="grid max-h-[400px] grid-cols-6 gap-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#39ff9f33]">
              {displayedCompanies.map((company) => (
                <div
                  key={company.domain}
                  className="relative cursor-pointer rounded-lg border bg-[#041812]/80 p-2 transition-transform duration-150 hover:scale-110 hover:shadow-[0_18px_45px_rgba(0,0,0,0.55)]"
                  style={{
                    borderColor: COLORS[company.provider as keyof typeof COLORS] || COLORS.Other,
                    boxShadow: `0 0 20px ${(COLORS[company.provider as keyof typeof COLORS] || COLORS.Other)}33`,
                  }}
                  title={`${company.name} - ${company.provider}`}
                >
                  <img
                    src={`https://logo.clearbit.com/${company.domain}`}
                    alt={company.name}
                    className="w-full h-full object-contain aspect-square"
                    onError={(e) => {
                      const target = e.currentTarget
                      if (target.src.includes('clearbit')) {
                        target.src = `https://www.google.com/s2/favicons?domain=${company.domain}&sz=128`
                      } else if (target.src.includes('google.com')) {
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random&size=128`
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
