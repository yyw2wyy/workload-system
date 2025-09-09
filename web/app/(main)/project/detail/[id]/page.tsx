"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { FileIcon } from "lucide-react"
import {projectStatusMap, Project} from "@/lib/types/project"

export default function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ returnUrl?: string }>
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const resolvedSearchParams = use(searchParams)
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 获取项目详情
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true)
        const response = await api.get(`/project/${resolvedParams.id}/`)
        setProject(response.data)
      } catch (error: any) {
        console.error("获取项目详情失败:", error)
        
        if (error.response?.status === 401) {
          router.push("/login")
          return
        }

        toast.error("获取项目详情失败", {
          description: error.response?.data?.detail || "请稍后重试",
          duration: 3000,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [resolvedParams.id, router])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (resolvedSearchParams.returnUrl) {
                router.push(resolvedSearchParams.returnUrl)
              } else {
                router.back()
              }
            }}
            className="h-9 w-9 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-2xl font-semibold tracking-tight">加载中...</h3>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (resolvedSearchParams.returnUrl) {
                router.push(resolvedSearchParams.returnUrl)
              } else {
                router.back()
              }
            }}
            className="h-9 w-9 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-2xl font-semibold tracking-tight">未找到项目信息</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (resolvedSearchParams.returnUrl) {
                router.push(resolvedSearchParams.returnUrl)
              } else {
                router.back()
              }
            }}
            className="h-9 w-9 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">项目详情</h3>
            <p className="text-sm text-muted-foreground mt-1">查看项目的详细信息</p>
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

            {/* 提交信息 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">提交人</Label>
                <div className="text-base">{project.submitter.username}</div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">提交时间</Label>
                <div className="text-base">
                  {format(new Date(project.created_at), "yyyy年MM月dd日 HH:mm:ss")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 审核信息卡片 */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">审核信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {project.teacher_comment && (
              <>
                <div className="space-y-6">
                  <Label className="block text-base font-semibold">教师审核</Label>
                  <div className="space-y-2.5">
                    <div className="whitespace-pre-wrap rounded-lg border bg-gray-50/50 p-4 text-base">
                      {project.teacher_comment}
                    </div>
                    <div className="text-sm text-gray-500">
                      审核时间：{project.teacher_review_time && 
                        format(new Date(project.teacher_review_time), "yyyy年MM月dd日 HH:mm:ss")}
                    </div>
                  </div>
                </div>
              </>
            )}

            {!project.teacher_comment && (
              <div className="flex items-center justify-center h-24 text-muted-foreground">
                暂无审核信息
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 