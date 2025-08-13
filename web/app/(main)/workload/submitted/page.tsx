"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Eye, Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import {sourceMap, typeMap, intensityTypeMap, statusMap } from "@/lib/types/workload"

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
}

export default function WorkloadSubmittedPage() {
  const router = useRouter()
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedSource, setSelectedSource] = useState<string>("all")
  const [isStudent, setIsStudent] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // 从本地存储获取用户角色
  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    setIsStudent(userRole === 'student')
  }, [])

  const fetchWorkloads = async () => {
    try {
      const response = await api.get("/workload/", {
        params: {
          submitted: true
        }
      })
      setWorkloads(response.data)
      setIsLoading(false)
    } catch (error: any) {
      console.error("获取工作量列表失败:", error)
      
      if (error.response?.status === 401) {
        router.push("/login")
        return
      }

      if (error.response?.status === 500) {
        toast.error("获取工作量列表失败", {
          description: "服务器内部错误，请联系管理员",
          duration: 5000,
        })
        return
      }
      
      toast.error("获取工作量列表失败", {
        description: error.response?.data?.detail || "请刷新页面重试",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkloads()

    // 设置自动刷新定时器，每30秒刷新一次
    const refreshInterval = setInterval(() => {
      fetchWorkloads()
    }, 30000) // 30秒

    // 组件卸载时清除定时器
    return () => clearInterval(refreshInterval)
  }, [router])

  // 添加手动刷新功能
  const handleRefresh = () => {
    setIsLoading(true)
    fetchWorkloads()
  }

  // 处理删除工作量
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/workload/${id}/`)
      toast.success("删除成功")
      // 重新获取列表
      fetchWorkloads()
    } catch (error: any) {
      console.error("删除工作量失败:", error)
      toast.error("删除失败", {
        description: error.response?.data?.detail || "请稍后重试",
      })
    }
  }

  // 判断工作量是否可编辑（未审核或审核未通过）
  const isEditable = (status: string) => {
    return status === "pending" || status.includes("rejected")
  }

  // 筛选工作量列表
  const filteredWorkloads = workloads.filter((workload) => {
    const matchesStatus = selectedStatus === "all" || workload.status === selectedStatus
    const matchesSource = selectedSource === "all" || workload.source === selectedSource
    return matchesStatus && matchesSource
  })

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
              <h3 className="text-2xl font-semibold tracking-tight">已提交工作量</h3>
              <p className="text-sm text-muted-foreground">
                查看所有已提交的工作量及其审核状态
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
              <Select value={selectedStatus} onValueChange={(value) => {
                setSelectedStatus(value)
                setCurrentPage(1)
              }}>
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

              <Select value={selectedSource} onValueChange={(value) => {
                setSelectedSource(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-full sm:w-[180px] h-10">
                  <SelectValue placeholder="选择来源" />
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
                  <TableHead className="font-semibold">来源</TableHead>
                  <TableHead className="font-semibold">类型</TableHead>
                  <TableHead className="font-semibold">开始日期</TableHead>
                  <TableHead className="font-semibold">结束日期</TableHead>
                  <TableHead className="font-semibold">强度类型</TableHead>
                  <TableHead className="font-semibold">强度值</TableHead>
                  {isStudent && <TableHead className="font-semibold">导师审核人</TableHead>}
                  <TableHead className="font-semibold">教师审核人</TableHead>
                  <TableHead className="font-semibold">状态</TableHead>
                  <TableHead className="text-right font-semibold">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={isStudent ? 11 : 10} className="h-32 text-center">
                      <div className="flex items-center justify-center text-muted-foreground">
                        加载中...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentWorkloads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isStudent ? 11 : 10} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p>暂无工作量记录</p>
                        <p className="text-sm">请提交新的工作量</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentWorkloads.map((workload) => (
                    <TableRow key={workload.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{workload.name}</TableCell>
                      <TableCell>{sourceMap[workload.source]}</TableCell>
                      <TableCell>{typeMap[workload.work_type]}</TableCell>
                      <TableCell>{format(new Date(workload.start_date), "yyyy年MM月dd日")}</TableCell>
                      <TableCell>{format(new Date(workload.end_date), "yyyy年MM月dd日")}</TableCell>
                      <TableCell>{intensityTypeMap[workload.intensity_type]}</TableCell>
                      <TableCell>{workload.intensity_value}</TableCell>
                      {isStudent && <TableCell>{workload.mentor_reviewer?.username || '-'}</TableCell>}
                      <TableCell>{workload.teacher_reviewer?.username || '-'}</TableCell>
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
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/workload/${workload.id}`)}
                          className="h-8 w-8 hover:bg-gray-100"
                          title="查看详情"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isEditable(workload.status) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/workload/${workload.id}/edit`)}
                              className="h-8 w-8 hover:bg-gray-100"
                              title="修改"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-red-100 text-red-500 hover:text-red-600"
                                  title="删除"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    确定要删除这条工作量记录吗？此操作无法撤销。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="hover:bg-gray-100">取消</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(workload.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                  >
                                    删除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
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