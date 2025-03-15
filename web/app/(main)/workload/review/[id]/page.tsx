"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

// 审核结果选项
const reviewOptions = [
  { value: "approved", label: "通过" },
  { value: "rejected", label: "拒绝" },
]

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

export default function WorkloadReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuthStore()
  const [workload, setWorkload] = useState<Workload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reviewStatus, setReviewStatus] = useState<string>("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 获取工作量详情
  useEffect(() => {
    const fetchWorkload = async () => {
      try {
        setIsLoading(true)
        const response = await api.get(`/workload/${id}/`)
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
  }, [id, router])

  // 提交审核
  const handleSubmit = async () => {
    if (!reviewStatus || !comment) {
      toast.error("请填写完整的审核信息")
      return
    }

    try {
      setIsSubmitting(true)
      const status = user?.role === "mentor" 
        ? `mentor_${reviewStatus}` 
        : `teacher_${reviewStatus}`

      const response = await api.post(`/workload/${id}/review/`, {
        status,
        [user?.role === "mentor" ? "mentor_comment" : "teacher_comment"]: comment
      })

      toast.success("审核成功")
      router.push("/workload/review")
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
    return <div className="container mx-auto py-10">加载中...</div>
  }

  if (!workload) {
    return <div className="container mx-auto py-10">未找到工作量信息</div>
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">审核工作量</h3>
          <p className="text-sm text-muted-foreground">
            查看工作量详情并进行审核
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/workload/review")}>
          返回列表
        </Button>
      </div>

      {/* 工作量详情卡片 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>工作量详情</CardTitle>
          {(user?.role === "mentor" || user?.role === "teacher") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/workload/${id}/edit?returnUrl=/workload/review/${id}`)}
            >
              编辑工作量
            </Button>
          )}
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

          {/* 显示导师审核信息（如果有） */}
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
        </CardContent>
      </Card>

      {/* 审核操作区域 */}
      <Card>
        <CardHeader>
          <CardTitle>审核操作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>审核结果</Label>
            <Select value={reviewStatus} onValueChange={setReviewStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="请选择审核结果" />
              </SelectTrigger>
              <SelectContent>
                {reviewOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>审核意见</Label>
            <Textarea
              className="mt-1"
              placeholder="请输入审核意见"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => router.push("/workload/review")}>
              取消
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !reviewStatus || !comment}
            >
              {isSubmitting ? "提交中..." : "提交审核"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 