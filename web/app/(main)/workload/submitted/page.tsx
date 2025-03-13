"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
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
  source: keyof typeof sourceMap
  work_type: keyof typeof typeMap
  start_date: string
  end_date: string
  intensity_type: keyof typeof intensityTypeMap
  intensity_value: number
  reviewer: {
    id: number
    username: string
    role: string
  }
  status: keyof typeof statusMap
}

export default function WorkloadSubmittedPage() {
  const router = useRouter()
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWorkloads = async () => {
      try {
        const response = await api.get("/workload/")
        setWorkloads(response.data)
        setIsLoading(false)
      } catch (error: any) {
        console.error("获取工作量列表失败:", error)
        
        // 如果是未认证错误，重定向到登录页面
        if (error.response?.status === 401) {
          router.push("/login")
          return
        }
        
        toast.error("获取工作量列表失败", {
          description: "请刷新页面重试",
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
          <h3 className="text-lg font-medium">已提交工作量</h3>
          <p className="text-sm text-muted-foreground">
            查看所有已提交的工作量及其审核状态
          </p>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>工作量名称</TableHead>
                <TableHead>来源</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>开始日期</TableHead>
                <TableHead>结束日期</TableHead>
                <TableHead>强度类型</TableHead>
                <TableHead>强度值</TableHead>
                <TableHead>审核人</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : workloads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    暂无工作量记录
                  </TableCell>
                </TableRow>
              ) : (
                workloads.map((workload) => (
                  <TableRow key={workload.id}>
                    <TableCell>{workload.name}</TableCell>
                    <TableCell>{sourceMap[workload.source]}</TableCell>
                    <TableCell>{typeMap[workload.work_type]}</TableCell>
                    <TableCell>{format(new Date(workload.start_date), "yyyy年MM月dd日")}</TableCell>
                    <TableCell>{format(new Date(workload.end_date), "yyyy年MM月dd日")}</TableCell>
                    <TableCell>{intensityTypeMap[workload.intensity_type]}</TableCell>
                    <TableCell>{workload.intensity_value}</TableCell>
                    <TableCell>{workload.reviewer.username}</TableCell>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
} 