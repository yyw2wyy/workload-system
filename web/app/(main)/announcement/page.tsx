"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { api } from "@/lib/api"
import { Announcement } from "@/lib/types/announcement"


export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data } = await api.get<Announcement[]>("/announcement/")
        // 确保返回的是数组
        if (Array.isArray(data)) {
          const generalAnnouncements = data.filter(a => !a.source)
          setAnnouncements(generalAnnouncements)
        } else {
          throw new Error("获取公告数据格式错误")
        }
      } catch (err) {
        console.error("Error fetching announcements:", err)
        setError(err instanceof Error ? err.message : "获取公告失败")
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">系统公告</h1>
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">{announcement.title}</h2>
                <span className="text-sm text-gray-500">
                  {format(new Date(announcement.updated_at), "yyyy年MM月dd日 HH:mm", {
                    locale: zhCN,
                  })}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{announcement.content}</p>
            </CardContent>
          </Card>
        ))}
        {announcements.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            暂无公告
          </div>
        )}
      </div>
    </div>
  )
} 