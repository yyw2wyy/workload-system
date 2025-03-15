"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, FileIcon, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/axios"
import { toast } from "sonner"

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

// 工作量类型定义
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
  mentor_comment?: string
  teacher_comment?: string
  mentor_review_time?: string
  teacher_review_time?: string
  created_at: string
  updated_at: string
}

export default function WorkloadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [workload, setWorkload] = useState<Workload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStudent, setIsStudent] = useState(false)
  const resolvedParams = use(params)

  // 从本地存储获取用户角色
  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    setIsStudent(userRole === 'student')
  }, [])

  useEffect(() => {
    const fetchWorkload = async () => {
      try {
        const response = await api.get(`/workload/${resolvedParams.id}/`)
        setWorkload(response.data)
      } catch (error: any) {
        console.error("获取工作量详情失败:", error)
        
        // 如果是未认证错误，重定向到登录页面
        if (error.response?.status === 401) {
          router.push("/login")
          return
        }

        toast.error("获取工作量详情失败", {
          description: error.response?.data?.detail || "请稍后重试",
          duration: 3000,
        })
        
        // 其他错误返回列表页
        router.push("/workload/submitted")
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
            onClick={() => router.push("/workload/submitted")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">加载中...</h3>
        </div>
      </div>
    )
  }

  if (!workload) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/workload/submitted")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">工作量详情</h3>
        </div>

        {/* 基本信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>{workload.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>工作量来源</Label>
                <div>{sourceMap[workload.source]}</div>
              </div>
              <div className="space-y-2">
                <Label>工作类型</Label>
                <div>{typeMap[workload.work_type]}</div>
              </div>
              <div className="space-y-2">
                <Label>开始日期</Label>
                <div>{format(new Date(workload.start_date), "yyyy年MM月dd日")}</div>
              </div>
              <div className="space-y-2">
                <Label>结束日期</Label>
                <div>{format(new Date(workload.end_date), "yyyy年MM月dd日")}</div>
              </div>
              <div className="space-y-2">
                <Label>工作强度类型</Label>
                <div>{intensityTypeMap[workload.intensity_type]}</div>
              </div>
              <div className="space-y-2">
                <Label>工作强度值</Label>
                <div>{workload.intensity_value}</div>
              </div>
            </div>

            <Separator />

            {/* 工作内容 */}
            <div className="space-y-2">
              <Label>工作内容</Label>
              <div className="whitespace-pre-wrap rounded-lg border p-4">
                {workload.content}
              </div>
            </div>

            <Separator />

            {/* 附件 */}
            <div className="space-y-4">
              {workload.image_path && (
                <div className="space-y-2">
                  <Label>图片附件</Label>
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="h-4 w-4" />
                    <a
                      href={workload.image_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      查看图片
                    </a>
                  </div>
                </div>
              )}

              {workload.file_path && (
                <div className="space-y-2">
                  <Label>文件附件</Label>
                  <div className="flex items-center space-x-2">
                    <FileIcon className="h-4 w-4" />
                    <a
                      href={workload.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      下载文件
                    </a>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* 时间信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>创建时间</Label>
                <div>{format(new Date(workload.created_at), "yyyy年MM月dd日 HH:mm:ss")}</div>
              </div>
              <div className="space-y-2">
                <Label>更新时间</Label>
                <div>{format(new Date(workload.updated_at), "yyyy年MM月dd日 HH:mm:ss")}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 审核信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>审核信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 审核状态 */}
            <div className="space-y-2">
              <Label>审核状态</Label>
              <div>
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

            <Separator />

            {/* 导师审核信息 */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">导师审核</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>审核人</Label>
                  <div>{workload.mentor_reviewer?.username || '-'}</div>
                </div>
                <div className="space-y-2">
                  <Label>审核时间</Label>
                  <div>
                    {workload.mentor_review_time 
                      ? format(new Date(workload.mentor_review_time), "yyyy年MM月dd日 HH:mm:ss")
                      : '-'}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>审核评语</Label>
                <div className="whitespace-pre-wrap rounded-lg border p-4">
                  {workload.mentor_comment || '暂无评语'}
                </div>
              </div>
            </div>

            <Separator />

            {/* 教师审核信息 */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">教师审核</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>审核人</Label>
                  <div>{workload.teacher_reviewer?.username || '-'}</div>
                </div>
                <div className="space-y-2">
                  <Label>审核时间</Label>
                  <div>
                    {workload.teacher_review_time 
                      ? format(new Date(workload.teacher_review_time), "yyyy年MM月dd日 HH:mm:ss")
                      : '-'}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>审核评语</Label>
                <div className="whitespace-pre-wrap rounded-lg border p-4">
                  {workload.teacher_comment || '暂无评语'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 