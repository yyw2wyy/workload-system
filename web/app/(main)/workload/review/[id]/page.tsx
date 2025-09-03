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
import { ArrowLeft, Download } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  Workload,
  sourceMap,
  typeMap,
  intensityTypeMap,
  reviewOptions, innovationStageMap
} from "@/lib/types/workload"

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
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/workload/review")}
            className="h-9 w-9 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-2xl font-semibold tracking-tight">加载中...</h3>
        </div>
      </div>
    )
  }

  if (!workload) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/workload/review")}
            className="h-9 w-9 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">审核工作量</h3>
            <p className="text-sm text-muted-foreground mt-1">查看工作量详情并进行审核</p>
          </div>
        </div>

        {/* 基本信息卡片 */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{workload.name}</CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push(`/workload/${workload.id}/edit?returnUrl=/workload/review/${workload.id}`)}
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
                <Label className="text-sm font-medium text-gray-500">工作量来源</Label>
                <div className="text-base">{sourceMap[workload.source]}</div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">工作类型</Label>
                <div className="text-base">{typeMap[workload.work_type]}</div>
              </div>
              {/* 如果是大创，则显示大创阶段 */}
              {workload.source === "innovation" && workload.innovation_stage && (
                <div className="space-y-2.5">
                  <Label className="text-sm font-medium text-gray-500">大创阶段</Label>
                  <div className="text-base">{innovationStageMap[workload.innovation_stage]}</div>
                </div>
              )}
              {/* 如果是大创，则显示参与人 */}
              {workload.source === "innovation" && workload.shares && workload.shares.length > 0 && (
                <div className="col-span-1 sm:col-span-2 space-y-2.5">
                  <Label className="text-sm font-medium text-gray-500">参与人</Label>
                  <div className="rounded-lg border bg-gray-50/50 p-4 space-y-2">
                    {workload.shares.map((share) => (
                      <div key={share.user} className="flex justify-between items-center text-base">
                        <span>{share.user_info.username}</span>
                        <span className="text-gray-600">{share.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* 如果是助教，则显示已发助教工资 */}
              {workload.source === "assistant" && workload.assistant_salary_paid !== null && (
                <div className="space-y-2.5">
                  <Label className="text-sm font-medium text-gray-500">已发助教工资</Label>
                  <div className="text-base">{workload.assistant_salary_paid} 元</div>
                </div>
              )}
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">开始日期</Label>
                <div className="text-base">{format(new Date(workload.start_date), "yyyy年MM月dd日")}</div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">结束日期</Label>
                <div className="text-base">{format(new Date(workload.end_date), "yyyy年MM月dd日")}</div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">工作强度类型</Label>
                <div className="text-base">{intensityTypeMap[workload.intensity_type]}</div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">工作强度值</Label>
                <div className="text-base">{workload.intensity_value}</div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* 工作内容 */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-gray-500">工作内容</Label>
              <div className="text-base whitespace-pre-wrap">{workload.content}</div>
            </div>

            <Separator className="my-6" />

            {/* 证明材料 */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-gray-500">证明材料</Label>
              <div className="flex items-center space-x-4">
                {workload.attachments_url ? (
                  <a
                    href={workload.attachments_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={workload.original_filename || undefined}
                    className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4" />
                    <span>{workload.original_filename || '下载附件'}</span>
                  </a>
                ) : (
                  <div className="text-gray-500">无附件</div>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            {/* 提交信息 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">提交人</Label>
                <div className="text-base">{workload.submitter.username}</div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">提交时间</Label>
                <div className="text-base">
                  {format(new Date(workload.created_at), "yyyy年MM月dd日 HH:mm:ss")}
                </div>
              </div>
            </div>

            {/* 如果有导师审核信息，显示导师审核信息 */}
            {workload.mentor_comment && (
              <>
                <Separator className="my-6" />
                <div className="space-y-6">
                  <Label className="block text-base font-semibold">导师审核意见</Label>
                  <div className="space-y-2.5">
                    <div className="whitespace-pre-wrap rounded-lg border bg-gray-50/50 p-4 text-base">
                      {workload.mentor_comment}
                    </div>
                    <div className="text-sm text-gray-500">
                      审核时间：{workload.mentor_review_time 
                        ? format(new Date(workload.mentor_review_time), "yyyy年MM月dd日 HH:mm:ss")
                        : '-'}
                    </div>
                  </div>
                </div>
              </>
            )}
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
              <Select value={reviewStatus} onValueChange={setReviewStatus}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="请选择审核结果" />
                </SelectTrigger>
                <SelectContent>
                  {reviewOptions.map(option => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                onClick={() => router.push("/workload/review")}
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