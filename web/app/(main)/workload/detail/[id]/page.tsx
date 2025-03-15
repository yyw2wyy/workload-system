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
import { useAuthStore } from "@/lib/store/auth"

// 工作量来源映射
const sourceMap = {
  horizontal: "横向",
  innovation: "大创",
  hardware: "硬件小组",
  assessment: "考核小组",
}

// 工作类型映射
const typeMap = {
  remote: "远程",
  onsite: "实地",
}

// 工作强度类型映射
const intensityTypeMap = {
  total: "总计",
  daily: "每天",
  weekly: "每周",
}

// 状态映射
const statusMap = {
  pending: "待审核",
  mentor_approved: "导师已审核",
  teacher_approved: "教师已审核",
  mentor_rejected: "导师已驳回",
  teacher_rejected: "教师已驳回",
}

type Workload = {
  id: number
  name: string
  content: string
  source: keyof typeof sourceMap
  work_type: keyof typeof typeMap
  start_date: string
  end_date: string
  intensity_type: keyof typeof intensityTypeMap
  intensity_value: number
  image_path: string | null
  file_path: string | null
  submitter: {
    id: number
    username: string
    role: string
  }
  mentor_reviewer: {
    id: number
    username: string
    role: string
  } | null
  teacher_reviewer: {
    id: number
    username: string
    role: string
  } | null
  status: keyof typeof statusMap
  mentor_comment: string | null
  mentor_review_time: string | null
  teacher_comment: string | null
  teacher_review_time: string | null
  created_at: string
}

export default function WorkloadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ returnUrl?: string }>
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const resolvedSearchParams = use(searchParams)
  const [workload, setWorkload] = useState<Workload | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 获取工作量详情
  useEffect(() => {
    const fetchWorkload = async () => {
      try {
        setIsLoading(true)
        const response = await api.get(`/workload/${resolvedParams.id}/`)
        setWorkload(response.data)
      } catch (error: any) {
        console.error("获取工作量详情失败:", error)
        
        if (error.response?.status === 401) {
          router.push("/login")
          return
        }

        toast.error("获取工作量详情失败", {
          description: error.response?.data?.detail || "请稍后重试",
          duration: 3000,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkload()
  }, [resolvedParams.id, router])

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
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
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">加载中...</h3>
        </div>
      </div>
    )
  }

  if (!workload) {
    return (
      <div className="container mx-auto py-10">
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
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">未找到工作量信息</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
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
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-lg font-medium">工作量详情</h3>
            <p className="text-sm text-muted-foreground">
              查看工作量的详细信息
            </p>
          </div>
        </div>
      </div>

      {/* 工作量详情卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>工作量名称</Label>
              <div className="mt-1">{workload.name}</div>
            </div>
            <div>
              <Label>提交人</Label>
              <div className="mt-1">{workload.submitter.username}</div>
            </div>
            <div>
              <Label>工作量来源</Label>
              <div className="mt-1">{sourceMap[workload.source]}</div>
            </div>
            <div>
              <Label>工作类型</Label>
              <div className="mt-1">{typeMap[workload.work_type]}</div>
            </div>
            <div>
              <Label>开始日期</Label>
              <div className="mt-1">
                {format(new Date(workload.start_date), "yyyy年MM月dd日")}
              </div>
            </div>
            <div>
              <Label>结束日期</Label>
              <div className="mt-1">
                {format(new Date(workload.end_date), "yyyy年MM月dd日")}
              </div>
            </div>
            <div>
              <Label>工作强度</Label>
              <div className="mt-1">
                {workload.intensity_value} {intensityTypeMap[workload.intensity_type]}
              </div>
            </div>
            <div>
              <Label>提交时间</Label>
              <div className="mt-1">
                {format(new Date(workload.created_at), "yyyy年MM月dd日 HH:mm:ss")}
              </div>
            </div>
            <div>
              <Label>当前状态</Label>
              <div className="mt-1">
                <span className={`px-2 py-1 rounded-full text-sm ${
                  workload.status.includes("approved") 
                    ? "bg-green-100 text-green-800"
                    : workload.status.includes("rejected")
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {statusMap[workload.status]}
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label>工作内容</Label>
            <div className="mt-1 whitespace-pre-wrap">{workload.content}</div>
          </div>

          {workload.image_path && (
            <div>
              <Label>相关图片</Label>
              <div className="mt-1">
                <a href={workload.image_path} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  查看图片
                </a>
              </div>
            </div>
          )}

          {workload.file_path && (
            <div>
              <Label>相关文件</Label>
              <div className="mt-1">
                <a href={workload.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  查看文件
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 审核信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>审核信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {workload.mentor_comment && (
            <div>
              <Label>导师审核意见</Label>
              <div className="mt-1">
                <div className="whitespace-pre-wrap">{workload.mentor_comment}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {workload.mentor_review_time && 
                    format(new Date(workload.mentor_review_time), "yyyy年MM月dd日 HH:mm:ss")}
                </div>
              </div>
            </div>
          )}

          {workload.teacher_comment && (
            <div>
              <Label>教师审核意见</Label>
              <div className="mt-1">
                <div className="whitespace-pre-wrap">{workload.teacher_comment}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {workload.teacher_review_time && 
                    format(new Date(workload.teacher_review_time), "yyyy年MM月dd日 HH:mm:ss")}
                </div>
              </div>
            </div>
          )}

          {!workload.mentor_comment && !workload.teacher_comment && (
            <div className="text-center text-muted-foreground">
              暂无审核信息
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 