"use client"

import { useAuthStore } from "@/lib/store/auth"

export default function HomePage() {
  const { user } = useAuthStore()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">欢迎回来, {user?.username}</h1>
      <div className="mt-6">
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-6 sm:px-6">
            <h3 className="text-base font-semibold leading-7 text-gray-900">工作量管理系统</h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              在这里您可以管理和查看工作量信息
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 