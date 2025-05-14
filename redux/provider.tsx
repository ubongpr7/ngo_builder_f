"use client"

import type React from "react"
import { useEffect } from "react"
import { makeStore } from "./store"
import { Provider } from "react-redux"
import { useRef } from "react"
import { ErrorBoundary } from "react-error-boundary"

interface Props {
  children: React.ReactNode
}

function AutoRefreshFallback() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])
  
  return <div className="hidden"></div>
}

export default function StoreProvider({ children }: Props) {
  const storeRef = useRef<ReturnType<typeof makeStore> | null>(null)
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  return (
    <ErrorBoundary FallbackComponent={AutoRefreshFallback} onError={(error) => {
    }}>
      <Provider store={storeRef.current}>{children}</Provider>
    </ErrorBoundary>
  )
}