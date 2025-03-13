"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth"
import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

const navigation = [
  { name: "用户中心", href: "/profile" },
  {
    name: "工作量提交",
    items: [
      { name: "提交工作量", href: "/workload/submit" },
      { name: "已提交工作量", href: "/workload/submitted" },
    ],
  },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  // 如果用户未登录，不显示导航栏
  if (!user) return null

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r">
      {/* 顶部Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        <span className="text-xl font-bold">工作量系统</span>
      </div>


      {/* 导航菜单 */}
      <nav className="px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              {!item.items ? (
                <Link
                  href={item.href}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-gray-50"
                  }`}
                >
                  {item.name}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setExpandedItem(expandedItem === item.name ? null : item.name)}
                    className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-gray-50"
                  >
                    <span>{item.name}</span>
                    {expandedItem === item.name ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {expandedItem === item.name && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {item.items.map((subItem) => (
                        <li key={subItem.href}>
                          <Link
                            href={subItem.href}
                            className={`flex items-center px-2 py-2 text-sm rounded-md ${
                              pathname === subItem.href
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-gray-50"
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
} 