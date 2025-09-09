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
import {Project, projectStatusMap, reviewStatusMap} from "@/lib/types/project"


export default function ProjectReviewHistoryPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [submitters, setSubmitters] = useState<{ id: number; username: string }[]>([])
  const [selectedSubmitter, setSelectedSubmitter] = useState<string | undefined>(undefined)
  const [selectedProjectStatus, setSelectedProjectStatus] = useState<string | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // 获取已审核项目列表
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        const response = await api.get("/project/approved_review/")
        const projectData = Array.isArray(response.data) ? response.data : []
        setProjects(projectData)
        setFilteredProjects(projectData)

        // 提取所有不重复的提交人
        const uniqueSubmitters = Array.from(
          new Map(
            projectData.map(w => [w.submitter.id, w.submitter])
          ).values()
        )
        setSubmitters(uniqueSubmitters)
      } catch (error: any) {
        console.error("获取已审核项目列表失败:", error)

        if (error.response?.status === 401) {
          router.push("/login")
          return
        }

        toast.error("获取已审核项目列表失败", {
          description: error.response?.data?.detail || "请稍后重试",
          duration: 3000,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [router])

  // 筛选项目
  useEffect(() => {
    let filtered = [...projects]

    if (selectedSubmitter && selectedSubmitter !== "all") {
      filtered = filtered.filter(w => w.submitter.id.toString() === selectedSubmitter)
    }

    if (selectedProjectStatus && selectedProjectStatus !== "all") {
      filtered = filtered.filter(w => w.project_status === selectedProjectStatus)
    }

    setFilteredProjects(filtered)
  }, [projects, selectedSubmitter, selectedProjectStatus])

  // 计算分页数据
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProjects = filteredProjects.slice(startIndex, endIndex)

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
              <h3 className="text-2xl font-semibold tracking-tight">历史审核记录</h3>
              <p className="text-sm text-muted-foreground">
                查看已审核的项目记录
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
                value={selectedProjectStatus}
                onValueChange={(value) => {
                  setSelectedProjectStatus(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-10">
                  <SelectValue placeholder="选择项目状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {Object.entries(projectStatusMap).map(([key, value]) => (
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
                  <TableHead className="font-semibold">项目名称</TableHead>
                  <TableHead className="font-semibold">项目状态</TableHead>
                  <TableHead className="font-semibold">开始日期</TableHead>
                  <TableHead className="font-semibold">提交人</TableHead>
                  <TableHead className="font-semibold">提交时间</TableHead>
                  <TableHead className="font-semibold">审核状态</TableHead>
                  {/*<TableHead className="text-center font-semibold">操作</TableHead>*/}
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
                ) : currentProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p>暂无已审核的项目</p>
                        <p className="text-sm">请等待项目提交和审核</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentProjects.map((project) => (
                    <TableRow key={project.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{projectStatusMap[project.project_status]}</TableCell>
                      <TableCell>{project.start_date}</TableCell>
                      <TableCell>{project.submitter.username}</TableCell>
                      <TableCell>{format(new Date(project.created_at), "yyyy年MM月dd日 HH:mm:ss")}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          project.review_status.includes("approved") 
                            ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                            : project.review_status.includes("rejected")
                            ? "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                            : "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20"
                        }`}>
                          {reviewStatusMap[project.review_status]}
                        </span>
                      </TableCell>


                      {/*<TableCell className="text-right">*/}
                      {/*  <Button*/}
                      {/*    variant="outline"*/}
                      {/*    size="sm"*/}
                      {/*    onClick={() => router.push(`/project/detail/${project.id}?returnUrl=/project/review/history`)}*/}
                      {/*    className="h-8 px-3 hover:bg-gray-100"*/}
                      {/*  >*/}
                      {/*    查看详情*/}
                      {/*  </Button>*/}
                      {/*</TableCell>*/}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* 分页控件 */}
            {!isLoading && filteredProjects.length > 0 && (
              <div className="flex items-center justify-between px-4 py-4 border-t bg-white">
                <div className="text-sm text-gray-500">
                  共 {filteredProjects.length} 条记录
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