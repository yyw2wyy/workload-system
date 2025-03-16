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
  const { user } = useAuthStore()
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedSource, setSelectedSource] = useState<string>("all")
  const [isStudent, setIsStudent] = useState(false)

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
  }, [router])

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

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">已提交工作量</h3>
            <p className="text-sm text-muted-foreground">
              查看所有已提交的工作量及其审核状态
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
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

            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择来源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部来源</SelectItem>
                <SelectItem value="horizontal">横向</SelectItem>
                <SelectItem value="innovation">大创</SelectItem>
                <SelectItem value="hardware">硬件小组</SelectItem>
                <SelectItem value="assessment">考核小组</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                {isStudent && <TableHead>导师审核人</TableHead>}
                <TableHead>教师审核人</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isStudent ? 11 : 10} className="text-center py-10">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredWorkloads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isStudent ? 11 : 10} className="text-center py-10">
                    暂无工作量记录
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkloads.map((workload) => (
                  <TableRow key={workload.id}>
                    <TableCell>{workload.name}</TableCell>
                    <TableCell>{sourceMap[workload.source]}</TableCell>
                    <TableCell>{typeMap[workload.work_type]}</TableCell>
                    <TableCell>{format(new Date(workload.start_date), "yyyy年MM月dd日")}</TableCell>
                    <TableCell>{format(new Date(workload.end_date), "yyyy年MM月dd日")}</TableCell>
                    <TableCell>{intensityTypeMap[workload.intensity_type]}</TableCell>
                    <TableCell>{workload.intensity_value}</TableCell>
                    {isStudent && <TableCell>{workload.mentor_reviewer?.username || '-'}</TableCell>}
                    <TableCell>{workload.teacher_reviewer?.username || '-'}</TableCell>
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
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/workload/${workload.id}`)}
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
                            title="修改"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600"
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
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(workload.id)}
                                  className="bg-red-500 hover:bg-red-600"
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
        </div>
      </div>
    </div>
  )
} 