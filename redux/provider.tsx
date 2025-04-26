"use client"

import type React from "react"
import { makeStore } from "./store"
import { Provider } from "react-redux"
import { useRef } from "react"

interface Props {
  children: React.ReactNode
}

export default function StoreProvider({ children }: Props) {
  const storeRef = useRef<ReturnType<typeof makeStore> | null>(null)
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
