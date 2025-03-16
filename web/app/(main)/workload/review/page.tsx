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
  intensity_type: string
  intensity_value: number
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
  created_at: string
}

export default function WorkloadReviewPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [filteredWorkloads, setFilteredWorkloads] = useState<Workload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [submitters, setSubmitters] = useState<{ id: number; username: string }[]>([])
  const [selectedSubmitter, setSelectedSubmitter] = useState<string | undefined>(undefined)
  const [selectedSource, setSelectedSource] = useState<string | undefined>(undefined)

  // 获取待审核工作量列表
  useEffect(() => {
    const fetchWorkloads = async () => {
      try {
        setIsLoading(true)
        console.log("开始获取待审核工作量列表...")
        console.log("当前用户角色:", user?.role)
        
        const response = await api.get("/workload/pending_review/", {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        })
        
        console.log("获取待审核工作量列表成功:", response.data)
        const workloadData = Array.isArray(response.data) ? response.data : []
        setWorkloads(workloadData)
        setFilteredWorkloads(workloadData)

        // 提取所有不重复的提交人
        const uniqueSubmitters = Array.from(
          new Map(
            workloadData.map(w => [w.submitter.id, w.submitter])
          ).values()
        )
        setSubmitters(uniqueSubmitters)
      } catch (error: any) {
        console.error("获取待审核工作量列表失败:", error)
        
        // 详细记录错误信息
        const errorDetails = {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        }
        console.error("错误详情:", errorDetails)
        
        if (error.response?.status === 401) {
          console.log("用户未登录，重定向到登录页面")
          router.push("/login")
          return
        }

        let errorMessage = "请稍后重试"
        if (typeof error.response?.data === 'string' && error.response?.data.includes('<!DOCTYPE html>')) {
          errorMessage = "服务器内部错误，请联系管理员"
          console.error("服务器返回了HTML错误页面")
        } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail
        } else if (error.response?.status === 500) {
          errorMessage = "服务器内部错误，请联系管理员"
        }

        toast.error("获取待审核工作量列表失败", {
          description: errorMessage,
          duration: 5000,
        })
      } finally {
        setIsLoading(false)
      }
    }

    // 只有当用户是导师或教师时才获取待审核列表
    if (user && (user.role === "mentor" || user.role === "teacher")) {
      fetchWorkloads()
    } else {
      console.log("当前用户不是导师或教师，不获取待审核列表")
      setIsLoading(false)
    }
  }, [router, user])

  // 筛选工作量
  useEffect(() => {
    let filtered = [...workloads]
    
    if (selectedSubmitter && selectedSubmitter !== "all") {
      filtered = filtered.filter(w => w.submitter.id.toString() === selectedSubmitter)
    }
    
    if (selectedSource && selectedSource !== "all") {
      filtered = filtered.filter(w => w.source === selectedSource)
    }
    
    setFilteredWorkloads(filtered)
  }, [workloads, selectedSubmitter, selectedSource])

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">待审核工作量</h3>
          <p className="text-sm text-muted-foreground">
            查看并审核{user?.role === "mentor" ? "学生" : ""}提交的工作量
          </p>
        </div>

        {/* 筛选区域 */}
        <div className="flex space-x-4">
          <div className="w-[200px]">
            <Select
              value={selectedSubmitter}
              onValueChange={setSelectedSubmitter}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择提交人" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部提交人</SelectItem>
                {submitters.map((submitter) => (
                  <SelectItem key={submitter.id} value={submitter.id.toString()}>
                    {submitter.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[200px]">
            <Select
              value={selectedSource}
              onValueChange={setSelectedSource}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择工作量来源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部来源</SelectItem>
                {Object.entries(sourceMap).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                <TableHead>提交时间</TableHead>
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
              ) : filteredWorkloads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    暂无待审核的工作量
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkloads.map((workload) => (
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
                      {format(new Date(workload.created_at), "yyyy年MM月dd日 HH:mm:ss")}
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
                        onClick={() => router.push(`/workload/review/${workload.id}`)}
                      >
                        审核
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