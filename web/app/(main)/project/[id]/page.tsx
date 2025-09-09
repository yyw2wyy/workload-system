"use client"

import { useEffect, useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, FileIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { 
  Project,
  projectStatusMap,
  reviewStatusMap
} from "@/lib/types/project"

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStudent, setIsStudent] = useState(false)
  const resolvedParams = use(params)

  // 获取返回 URL
  const returnUrl = searchParams.get('returnUrl') || '/project/declared'

  // 从本地存储获取用户角色
  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    setIsStudent(userRole === 'student')
  }, [])

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/project/${resolvedParams.id}/`)
        setProject(response.data)
      } catch (error: any) {
        console.error("获取项目详情失败:", error)
        
        // 如果是未认证错误，重定向到登录页面
        if (error.response?.status === 401) {
          router.push("/login")
          return
        }

        toast.error("获取项目详情失败", {
          description: error.response?.data?.detail || "请稍后重试",
          duration: 3000,
        })
        
        // 其他错误返回列表页
        router.push("/project/declared")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [resolvedParams.id, router])

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(returnUrl)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">加载中...</h3>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(returnUrl)}
            className="h-9 w-9 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">项目详情</h3>
            <p className="text-sm text-muted-foreground mt-1">查看项目的详细信息和审核状态</p>
          </div>
        </div>

        {/* 基本信息卡片 */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{project.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">项目状态</Label>
                <div className="text-base">{projectStatusMap[project.project_status]}</div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">开始日期</Label>
                <div className="text-base">{project.start_date}</div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* 时间信息 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">创建时间</Label>
                <div className="text-base">{format(new Date(project.created_at), "yyyy年MM月dd日 HH:mm:ss")}</div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">更新时间</Label>
                <div className="text-base">{format(new Date(project.updated_at), "yyyy年MM月dd日 HH:mm:ss")}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 审核信息卡片 */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">审核信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* 审核状态 */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-gray-500">审核状态</Label>
              <div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  project.review_status.includes("approved") 
                    ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                    : project.review_status.includes("rejected")
                    ? "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                    : "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20"
                }`}>
                  {reviewStatusMap[project.review_status]}
                </span>
              </div>
            </div>

            {/* 教师审核信息 */}
            <div className="space-y-6">
              <Label className="block text-base font-semibold">教师审核</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label className="text-sm font-medium text-gray-500">审核人</Label>
                  <div className="text-base">{project.teacher_reviewer?.username || '-'}</div>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-sm font-medium text-gray-500">审核时间</Label>
                  <div className="text-base">
                    {project.teacher_review_time 
                      ? format(new Date(project.teacher_review_time), "yyyy年MM月dd日 HH:mm:ss")
                      : '-'}
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">审核评语</Label>
                <div className="whitespace-pre-wrap rounded-lg border bg-gray-50/50 p-4 text-base">
                  {project.teacher_comment || '暂无评语'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 