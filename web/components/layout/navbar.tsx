"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth"
import { useState } from "react"
import { ChevronDown, ChevronRight, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "用户中心", href: "/profile" },
  {
    name: "通知和公告",
    items: [
      { name: "公告", href: "/announcement" },
    ]
  },
  {
    name: "总览",
    items: [
      { name: "所有工作量", href: "/workload/all" },
    ],
    roles: ["teacher"], // 只对教师显示
  },
  {
    name: "工作量提交",
    items: [
      { name: "提交工作量", href: "/workload/submit" },
      { name: "已提交工作量", href: "/workload/submitted" },
    ],
    roles: ["student", "mentor"], // 只对学生和导师显示
  },
  {
    name: "工作量审核",
    items: [
      { name: "审核工作量", href: "/workload/review" },
      { name: "历史审核", href: "/workload/review/history" },
    ],
    roles: ["mentor", "teacher"], // 只对导师和教师显示
  },
  {
    name: "项目申报",
    items: [
      { name: "申报项目", href: "/project/declare" },
      { name: "已申报项目", href: "/project/declared"},
    ],
    roles: ["mentor", "teacher"]
  },
  {
    name: "已批准项目",
    items: [
      { name: "已批准项目", href: "/project/approved" },
    ],
    roles: ["teacher"]
  },
  {
    name: "项目审核",
    items: [
      { name: "审核项目", href: "/project/review" },
      { name: "已审核项目", href: "/project/review/history"}
    ],
    roles: ["teacher"]
  },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  // 如果用户未登录，不显示导航栏
  if (!user) return null

  // 根据用户角色过滤导航项
  const filteredNavigation = navigation.filter(item => {
    // 如果没有指定角色限制，则所有角色都可见
    if (!item.roles) return true
    // 如果指定了角色限制，则只对指定角色可见
    return item.roles.includes(user.role)
  })

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r">
      {/* 顶部Logo和退出按钮 */}
      <div className="h-16 flex items-center justify-between px-6 border-b">
        <span className="text-xl font-bold">工作量系统</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => logout()}
          className="hover:bg-red-100 hover:text-red-600"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* 导航菜单 */}
      <nav className="px-4 py-4">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => (
            <li key={item.name}>
              {item.items ? (
                // 有子菜单的项目
                <div>
                  <button
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg hover:bg-gray-100 ${
                      item.items.some((subItem) => subItem.href === pathname)
                        ? "bg-gray-100 font-medium"
                        : ""
                    }`}
                    onClick={() =>
                      setExpandedItem(
                        expandedItem === item.name ? null : item.name
                      )
                    }
                  >
                    <span>{item.name}</span>
                    {expandedItem === item.name ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {expandedItem === item.name && (
                    <ul className="pl-4 mt-2 space-y-2">
                      {item.items.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            href={subItem.href}
                            className={`block px-4 py-2 text-sm rounded-lg hover:bg-gray-100 ${
                              pathname === subItem.href
                                ? "bg-gray-100 font-medium"
                                : ""
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                // 没有子菜单的项目
                <Link
                  href={item.href}
                  className={`block px-4 py-2 text-sm rounded-lg hover:bg-gray-100 ${
                    pathname === item.href ? "bg-gray-100 font-medium" : ""
                  }`}
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
} 