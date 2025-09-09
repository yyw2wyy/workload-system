"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker, ConfigProvider, Select as AntdSelect } from "antd"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import dayjs from "dayjs"
import zhCN from "antd/locale/zh_CN"
import "dayjs/locale/zh-cn"
import "antd/dist/reset.css"
import {
    Project,
    projectStatusMap,
    reviewStatusMap,
    statusOptions,
    ProjectFormValues,
    projectFormSchema,
    defaultFormValues,
} from "@/lib/types/project"
import { useAuthStore } from "@/lib/store/auth"

type Reviewer = { id: number; username: string; role: string }

export default function ProjectEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ returnUrl?: string }>
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const resolvedSearchParams = use(searchParams)
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStudent, setIsStudent] = useState(false)
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [allUsers, setAllUsers] = useState<Reviewer[]>([])
  const authUser = useAuthStore((state) => state.user)

  // 从本地存储获取用户角色
  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    setIsStudent(userRole === 'student')
  }, [])

  // 初始化表单
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: defaultFormValues,
  })

  // 获取项目详情
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/project/${resolvedParams.id}/`)
        setProject(response.data)

        // 填充表单数据
        form.reset({
            name: response.data.name,
            project_status: response.data.project_status,
            start_date: new Date(response.data.start_date),
        })

        // 设置项目数据
        setProject(project)
      } catch (error: any) {
        console.error("获取数据失败:", error)
        
        if (error.response?.status === 401) {
          router.push("/login")
          return
        }
        
        toast.error("获取数据失败", {
          description: error.response?.data?.detail || "请稍后重试",
        })
        router.push("/project/declared")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [resolvedParams.id, router, form])

  // 提交表单
  const onSubmit = async (values: ProjectFormValues) => {
    try {
      const formData = new FormData()
      
      // 添加基本字段
      formData.append("name", values.name)
      formData.append("project_status", values.project_status)
      formData.append("start_date", format(values.start_date, "yyyy-MM-dd"))


      await api.put(`/project/${resolvedParams.id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast.success("保存成功")
      
      // 如果有returnUrl参数，则返回到指定页面，否则返回到已提交项目页面
      if (resolvedSearchParams.returnUrl) {
        router.push(resolvedSearchParams.returnUrl)
      } else {
        router.push("/project/declared")
      }
    } catch (error: any) {
      console.error("保存失败:", error)
      toast.error("保存失败", {
        description: error.response?.data?.detail || "请稍后重试",
        duration: 3000,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (resolvedSearchParams.returnUrl) {
                router.push(resolvedSearchParams.returnUrl)
              } else {
                router.push("/project/declared")
              }
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">加载中...</h3>
        </div>
      </div>
    )
  }

  return (
    <ConfigProvider locale={zhCN}>
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
                  router.push("/project/declared")
                }
              }}
              className="h-9 w-9 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">编辑项目</h3>
              <p className="text-sm text-muted-foreground mt-1">修改项目信息</p>
            </div>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">项目信息</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                      control={form.control}
                      name="project_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">项目状态</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="请选择项目状态" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                  className="cursor-pointer hover:bg-gray-100"
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="empty:hidden" />
                        </FormItem>
                      )}
                    />

                  <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">项目名称</FormLabel>
                            <FormControl>
                                <Input placeholder="请输入项目名称" className="h-11" {...field} />
                            </FormControl>
                            <FormMessage className="empty:hidden" />
                        </FormItem>
                      )}
                  />

                  <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm font-medium text-gray-500">开始日期</FormLabel>
                          <FormControl>
                            <DatePicker
                              className="w-full h-10"
                              placeholder="选择日期"
                              format="YYYY年MM月DD日"
                              value={field.value ? dayjs(field.value) : null}
                              onChange={(date) => {
                                field.onChange(date ? date.toDate() : null)
                              }}
                            />
                          </FormControl>
                          <FormMessage className="empty:hidden" />
                        </FormItem>
                      )}
                  />

                   <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (resolvedSearchParams.returnUrl) {
                          router.push(resolvedSearchParams.returnUrl)
                        } else {
                          router.push("/project/declared")
                        }
                      }}
                      className="h-10 px-6 hover:bg-gray-100"
                    >
                      取消
                    </Button>
                    <Button 
                      type="submit"
                      className="h-10 px-6 bg-red-600 hover:bg-red-500"
                    >
                      保存
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ConfigProvider>
  )
} 