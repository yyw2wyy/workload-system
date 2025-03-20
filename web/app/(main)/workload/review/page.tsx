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
import { sourceMap, typeMap, statusMap } from "@/lib/types/workload"

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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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
      
      // 设置自动刷新定时器，每30秒刷新一次
      const refreshInterval = setInterval(() => {
        fetchWorkloads()
      }, 30000) // 30秒

      // 组件卸载时清除定时器
      return () => clearInterval(refreshInterval)
    } else {
      console.log("当前用户不是导师或教师，不获取待审核列表")
      setIsLoading(false)
    }
  }, [router, user])

  // 添加手动刷新功能
  const handleRefresh = () => {
    setIsLoading(true)
    const fetchWorkloads = async () => {
      try {
        const response = await api.get("/workload/pending_review/", {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        })
        
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
        toast.error("获取待审核工作量列表失败", {
          description: error.response?.data?.detail || "请稍后重试",
          duration: 3000,
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchWorkloads()
  }

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
              <h3 className="text-2xl font-semibold tracking-tight">待审核工作量</h3>
              <p className="text-sm text-muted-foreground">
                查看并审核{user?.role === "mentor" ? "学生" : ""}提交的工作量
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-10"
              >
                {isLoading ? "刷新中..." : "刷新"}
              </Button>
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
                        <p>暂无待审核的工作量</p>
                        <p className="text-sm">请等待学生提交工作量</p>
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
                          onClick={() => router.push(`/workload/review/${workload.id}`)}
                          className="h-8 px-3 hover:bg-gray-100"
                        >
                          审核
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