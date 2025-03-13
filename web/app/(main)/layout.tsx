"use client"

import { useAuthStore } from "@/lib/store/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
} 