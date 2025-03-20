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
import { sourceMap, typeMap, intensityTypeMap, statusMap, Workload } from "@/lib/types/workload"

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

  if (!workload) {
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
          <h3 className="text-2xl font-semibold tracking-tight">未找到工作量信息</h3>
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
            <h3 className="text-2xl font-semibold tracking-tight">工作量详情</h3>
            <p className="text-sm text-muted-foreground mt-1">查看工作量的详细信息</p>
          </div>
        </div>

        {/* 基本信息卡片 */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{workload.name}</CardTitle>
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
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-gray-500">当前状态</Label>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    workload.status.includes("approved") 
                      ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                      : workload.status.includes("rejected")
                      ? "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                      : "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20"
                  }`}>
                    {statusMap[workload.status]}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* 工作内容 */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-gray-500">工作内容</Label>
              <div className="whitespace-pre-wrap rounded-lg border bg-gray-50/50 p-4 text-base">
                {workload.content}
              </div>
            </div>

            <Separator className="my-6" />

            {/* 附件 */}
            <div className="space-y-6">
              {workload.attachments_url && (
                <div className="space-y-2.5">
                  <Label className="text-sm font-medium text-gray-500">证明材料</Label>
                  <div className="flex items-center space-x-2">
                    <FileIcon className="h-4 w-4 text-gray-500" />
                    <a
                      href={workload.attachments_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                      download={workload.original_filename || undefined}
                    >
                      {workload.original_filename || '下载附件'}
                    </a>
                  </div>
                </div>
              )}
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
          </CardContent>
        </Card>

        {/* 审核信息卡片 */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">审核信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {workload.mentor_comment && (
              <div className="space-y-6">
                <Label className="block text-base font-semibold">导师审核</Label>
                <div className="space-y-2.5">
                  <div className="whitespace-pre-wrap rounded-lg border bg-gray-50/50 p-4 text-base">
                    {workload.mentor_comment}
                  </div>
                  <div className="text-sm text-gray-500">
                    审核时间：{workload.mentor_review_time && 
                      format(new Date(workload.mentor_review_time), "yyyy年MM月dd日 HH:mm:ss")}
                  </div>
                </div>
              </div>
            )}

            {workload.teacher_comment && (
              <>
                {workload.mentor_comment && <Separator className="my-6" />}
                <div className="space-y-6">
                  <Label className="block text-base font-semibold">教师审核</Label>
                  <div className="space-y-2.5">
                    <div className="whitespace-pre-wrap rounded-lg border bg-gray-50/50 p-4 text-base">
                      {workload.teacher_comment}
                    </div>
                    <div className="text-sm text-gray-500">
                      审核时间：{workload.teacher_review_time && 
                        format(new Date(workload.teacher_review_time), "yyyy年MM月dd日 HH:mm:ss")}
                    </div>
                  </div>
                </div>
              </>
            )}

            {!workload.mentor_comment && !workload.teacher_comment && (
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