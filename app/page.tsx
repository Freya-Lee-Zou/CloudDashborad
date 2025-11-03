"use client"

import { useState } from "react"
import { CloudDependencyExplorer } from "../components/cloud-dependency-explorer"
import { AWSRegionsExplorer } from "../components/aws-regions-explorer"

export default function Page() {
  const [showRegions, setShowRegions] = useState(false)

  return (
    <div className="min-h-screen w-full">
      {showRegions ? (
        <AWSRegionsExplorer onBack={() => setShowRegions(false)} />
      ) : (
        <CloudDependencyExplorer onOpenRegions={() => setShowRegions(true)} />
      )}
    </div>
  )
}
