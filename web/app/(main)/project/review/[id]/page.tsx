"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/store/auth"
import { ArrowLeft, Download } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  Project,
  projectStatusMap,
  reviewOptions
} from "@/lib/types/project"

export default function ProjectReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuthStore()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reviewStatus, setReviewStatus] = useState<string>("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 获取项目详情
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true)
        const response = await api.get(`/project/${id}/`)
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
  }, [id, router])

  // 提交审核
  const handleSubmit = async () => {
    if (!reviewStatus || !comment) {
      toast.error("请填写完整的审核信息")
      return
    }

    try {
      setIsSubmitting(true)

      const response = await api.post(`/project/${id}/review/`, {
        review_status: reviewStatus,
        teacher_comment: comment
      })

      toast.success("审核成功")
      router.push("/project/review")
    } catch (error: any) {
      console.error("审核失败:", error)
      toast.error("审核失败", {
        description: error.response?.data?.detail || "请稍后重试",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/project/review")}
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
    return null
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/project/review")}
            className="h-9 w-9 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">审核项目</h3>
            <p className="text-sm text-muted-foreground mt-1">查看项目详情并进行审核</p>
          </div>
        </div>

        {/* 基本信息卡片 */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{project.name}</CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push(`/project/${project.id}/edit?returnUrl=/project/review/${project.id}`)}
                className="h-9 px-5 text-base hover:bg-gray-100"
              >
                修改
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">项目名称</Label>
                <div className="text-base">{project.name}</div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">项目状态</Label>
                <div className="text-base">{projectStatusMap[project.project_status]}</div>
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">参与人</Label>
                <div className="rounded-lg border bg-gray-50/50 p-4 space-y-2">
                  {project.shares.map((share) => (
                    <div key={share.user} className="flex justify-between items-center text-base">
                      <span>{share.user_info.username}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">项目开始日期</Label>
                <div className="text-base">{project.start_date}</div>
              </div>
            </div>

            <Separator className="my-6" />

            <Separator className="my-6" />

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

        {/* 审核操作卡片 */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">审核操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-gray-500">审核结果</Label>
              <div className="flex gap-2">
                {reviewOptions.map(option => {
                  const isActive = reviewStatus === option.value
                  return (
                    <Button
                      key={option.value}
                      onClick={() => setReviewStatus(option.value)}
                      variant={isActive ? "default" : "outline"}
                      className={`px-4 py-2 ${
                        isActive ? "ring-2 ring-offset-2 ring-red-500" : ""
                      }`}
                    >
                      {option.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-gray-500">审核意见</Label>
              <Textarea
                placeholder="请输入审核意见"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push("/project/review")}
                className="h-10 px-6 hover:bg-gray-100"
              >
                返回
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !reviewStatus || !comment}
                className="h-10 px-6 bg-red-600 hover:bg-red-500"
              >
                {isSubmitting ? "提交中..." : "提交审核"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}