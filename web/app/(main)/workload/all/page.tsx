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
import { Checkbox } from "@/components/ui/checkbox"


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
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined)
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedWorkloads, setSelectedWorkloads] = useState<number[]>([])
  const [isDownloading, setIsDownloading] = useState(false)
  const itemsPerPage = 10

  // 计算可用年份和月份选项
  const [yearOptions, setYearOptions] = useState<number[]>([])
  const [monthOptions, setMonthOptions] = useState<number[]>([])

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

      // 设置自动刷新定时器，每30秒刷新一次
      const refreshInterval = setInterval(() => {
        fetchWorkloads()
      }, 30000) // 30秒

      // 组件卸载时清除定时器
      return () => clearInterval(refreshInterval)
    } else {
      router.push("/")
    }
  }, [router, user])

  // 添加手动刷新功能
  const handleRefresh = () => {
    setIsLoading(true)
    const fetchWorkloads = async () => {
      try {
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
        toast.error("获取工作量列表失败", {
          description: error.response?.data?.detail || "请稍后重试",
          duration: 3000,
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchWorkloads()
  }

  // 更新年月数据
  useEffect(() => {
    if (workloads.length > 0) {
      // 提取所有不重复的年份
      const years = Array.from(
        new Set(
          workloads.map(w => new Date(w.created_at).getFullYear())
        )
      ).sort((a, b) => b - a); // 降序排列
      
      setYearOptions(years);
      
      // 当选择了年份时，计算该年份下的月份选项
      if (selectedYear) {
        const year = parseInt(selectedYear);
        const monthsInYear = Array.from(
          new Set(
            workloads
              .filter(w => new Date(w.created_at).getFullYear() === year)
              .map(w => new Date(w.created_at).getMonth() + 1) // JavaScript 月份从 0 开始
          )
        ).sort((a, b) => a - b); // 升序排列
        
        setMonthOptions(monthsInYear);
      } else {
        setMonthOptions([]);
      }
    }
  }, [workloads, selectedYear]);

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
    
    // 按年份筛选
    if (selectedYear && selectedYear !== "all") {
      const year = parseInt(selectedYear);
      filtered = filtered.filter(w => new Date(w.created_at).getFullYear() === year);
    }
    
    // 按月份筛选
    if (selectedMonth && selectedMonth !== "all" && selectedYear && selectedYear !== "all") {
      const month = parseInt(selectedMonth);
      filtered = filtered.filter(w => new Date(w.created_at).getMonth() + 1 === month);
    }
    
    setFilteredWorkloads(filtered)
    setCurrentPage(1) // 重置页码到第一页
  }, [workloads, selectedSubmitter, selectedSource, selectedStatus, selectedYear, selectedMonth])

  // 计算分页数据
  const totalPages = Math.ceil(filteredWorkloads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentWorkloads = filteredWorkloads.slice(startIndex, endIndex)

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // 处理全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWorkloads(currentWorkloads.map(w => w.id))
    } else {
      setSelectedWorkloads([])
    }
  }

  // 处理单个工作量选择
  const handleSelectWorkload = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedWorkloads(prev => [...prev, id])
    } else {
      setSelectedWorkloads(prev => prev.filter(workloadId => workloadId !== id))
    }
  }

  // 处理下载
  const handleDownload = async () => {
    if (selectedWorkloads.length === 0) {
      toast.error("请先选择要下载的工作量")
      return
    }

    try {
      setIsDownloading(true)
      const response = await api.post("/workload/export/", 
        { workload_ids: selectedWorkloads },
        { responseType: 'blob' }
      )

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `工作量记录_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("下载成功")
      setSelectedWorkloads([]) // 清空选择
    } catch (error) {
      console.error("下载失败:", error)
      toast.error("下载失败，请稍后重试")
    } finally {
      setIsDownloading(false)
    }
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
              <Button
                variant="default"
                size="sm"
                onClick={handleDownload}
                disabled={selectedWorkloads.length === 0 || isDownloading}
                className="h-10"
              >
                {isDownloading ? "下载中..." : `下载所选 (${selectedWorkloads.length})`}
              </Button>
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
                value={selectedYear}
                onValueChange={(value) => {
                  setSelectedYear(value);
                  setSelectedMonth(undefined); // 重置月份选择
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[120px] h-10">
                  <SelectValue placeholder="选择年份" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部年份</SelectItem>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}年
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedMonth}
                onValueChange={(value) => {
                  setSelectedMonth(value);
                  setCurrentPage(1);
                }}
                disabled={!selectedYear || selectedYear === "all"}
              >
                <SelectTrigger className="w-full sm:w-[120px] h-10">
                  <SelectValue placeholder="选择月份" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部月份</SelectItem>
                  {monthOptions.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {month}月
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
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
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={currentWorkloads.length > 0 && selectedWorkloads.length === currentWorkloads.length}
                      onCheckedChange={(checked: boolean) => handleSelectAll(checked)}
                      aria-label="全选"
                    />
                  </TableHead>
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
                      <TableCell>
                        <Checkbox
                          checked={selectedWorkloads.includes(workload.id)}
                          onCheckedChange={(checked: boolean) => handleSelectWorkload(workload.id, checked)}
                          aria-label={`选择工作量 ${workload.name}`}
                        />
                      </TableCell>
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