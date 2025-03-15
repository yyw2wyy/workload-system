"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

export default function WorkloadReviewHistoryPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 获取已审核工作量列表
  useEffect(() => {
    const fetchWorkloads = async () => {
      try {
        setIsLoading(true)
        const response = await api.get("/workload/reviewed/")
        setWorkloads(Array.isArray(response.data) ? response.data : [])
      } catch (error: any) {
        console.error("获取已审核工作量列表失败:", error)
        
        if (error.response?.status === 401) {
          router.push("/login")
          return
        }

        toast.error("获取已审核工作量列表失败", {
          description: error.response?.data?.detail || "请稍后重试",
          duration: 3000,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkloads()
  }, [router])

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">历史审核记录</h3>
          <p className="text-sm text-muted-foreground">
            查看已审核的工作量记录
          </p>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>工作量名称</TableHead>
                <TableHead>提交人</TableHead>
                <TableHead>工作量来源</TableHead>
                <TableHead>工作类型</TableHead>
                <TableHead>开始日期</TableHead>
                <TableHead>结束日期</TableHead>
                <TableHead>审核时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : workloads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    暂无已审核的工作量
                  </TableCell>
                </TableRow>
              ) : (
                workloads.map((workload) => (
                  <TableRow key={workload.id}>
                    <TableCell>{workload.name}</TableCell>
                    <TableCell>{workload.submitter.username}</TableCell>
                    <TableCell>{sourceMap[workload.source]}</TableCell>
                    <TableCell>{typeMap[workload.work_type]}</TableCell>
                    <TableCell>
                      {format(new Date(workload.start_date), "yyyy年MM月dd日")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(workload.end_date), "yyyy年MM月dd日")}
                    </TableCell>
                    <TableCell>
                      {workload.mentor_review_time && format(
                        new Date(workload.mentor_review_time),
                        "yyyy年MM月dd日 HH:mm:ss"
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        workload.status.includes("approved") 
                          ? "bg-green-100 text-green-800"
                          : workload.status.includes("rejected")
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {statusMap[workload.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/workload/detail/${workload.id}?returnUrl=/workload/review/history`)}
                      >
                        查看详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
} 