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

export default function WorkloadAllPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [filteredWorkloads, setFilteredWorkloads] = useState<Workload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [submitters, setSubmitters] = useState<{ id: number; username: string }[]>([])
  const [selectedSubmitter, setSelectedSubmitter] = useState<string | undefined>(undefined)
  const [selectedSource, setSelectedSource] = useState<string | undefined>(undefined)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // 获取所有工作量列表
  useEffect(() => {
    const fetchWorkloads = async () => {
      try {
        setIsLoading(true)
        const response = await api.get("/workload/all_workloads/")
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
        console.error("获取工作量列表失败:", error)
        
        if (error.response?.status === 401) {
          router.push("/login")
          return
        }

        toast.error("获取工作量列表失败", {
          description: error.response?.data?.detail || "请稍后重试",
          duration: 3000,
        })
      } finally {
        setIsLoading(false)
      }
    }

    // 只有教师可以访问此页面
    if (user?.role === "teacher") {
      fetchWorkloads()
    } else {
      router.push("/")
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

    if (selectedStatus !== "all") {
      filtered = filtered.filter(w => w.status === selectedStatus)
    }
    
    setFilteredWorkloads(filtered)
    setCurrentPage(1) // 重置页码到第一页
  }, [workloads, selectedSubmitter, selectedSource, selectedStatus])

  // 计算分页数据
  const totalPages = Math.ceil(filteredWorkloads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentWorkloads = filteredWorkloads.slice(startIndex, endIndex)

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6">
      <div className="space-y-8">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold tracking-tight">所有工作量</h3>
              <p className="text-sm text-muted-foreground">
                查看系统中的所有工作量记录
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <Select
                value={selectedSubmitter}
                onValueChange={(value) => {
                  setSelectedSubmitter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-10">
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

              <Select
                value={selectedSource}
                onValueChange={(value) => {
                  setSelectedSource(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-10">
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

              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-10">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待审核</SelectItem>
                  <SelectItem value="mentor_approved">导师已审核</SelectItem>
                  <SelectItem value="teacher_approved">教师已审核</SelectItem>
                  <SelectItem value="mentor_rejected">导师已驳回</SelectItem>
                  <SelectItem value="teacher_rejected">教师已驳回</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">工作量名称</TableHead>
                  <TableHead className="font-semibold">提交人</TableHead>
                  <TableHead className="font-semibold">工作量来源</TableHead>
                  <TableHead className="font-semibold">工作类型</TableHead>
                  <TableHead className="font-semibold">开始日期</TableHead>
                  <TableHead className="font-semibold">结束日期</TableHead>
                  <TableHead className="font-semibold">提交时间</TableHead>
                  <TableHead className="font-semibold">状态</TableHead>
                  <TableHead className="text-right font-semibold">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="flex items-center justify-center text-muted-foreground">
                        加载中...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentWorkloads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p>暂无工作量记录</p>
                        <p className="text-sm">请等待工作量提交</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentWorkloads.map((workload) => (
                    <TableRow key={workload.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{workload.name}</TableCell>
                      <TableCell>{workload.submitter.username}</TableCell>
                      <TableCell>{sourceMap[workload.source]}</TableCell>
                      <TableCell>{typeMap[workload.work_type]}</TableCell>
                      <TableCell>{format(new Date(workload.start_date), "yyyy年MM月dd日")}</TableCell>
                      <TableCell>{format(new Date(workload.end_date), "yyyy年MM月dd日")}</TableCell>
                      <TableCell>{format(new Date(workload.created_at), "yyyy年MM月dd日 HH:mm:ss")}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          workload.status.includes("approved") 
                            ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                            : workload.status.includes("rejected")
                            ? "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                            : "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20"
                        }`}>
                          {statusMap[workload.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/workload/${workload.id}?returnUrl=/workload/all`)}
                          className="h-8 px-3 hover:bg-gray-100"
                        >
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* 分页控件 */}
            {!isLoading && filteredWorkloads.length > 0 && (
              <div className="flex items-center justify-between px-4 py-4 border-t bg-white">
                <div className="text-sm text-gray-500">
                  共 {filteredWorkloads.length} 条记录
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 px-3 text-xs"
                  >
                    首页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 px-3 text-xs"
                  >
                    上一页
                  </Button>
                  <span className="text-sm text-gray-600">
                    第 {currentPage} / {totalPages} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3 text-xs"
                  >
                    下一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3 text-xs"
                  >
                    末页
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
} 