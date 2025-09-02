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
import { DatePicker, ConfigProvider } from "antd"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import dayjs from "dayjs"
import zhCN from "antd/locale/zh_CN"
import "dayjs/locale/zh-cn"
import "antd/dist/reset.css"
import {
    sourceOptions,
    typeOptions,
    intensityTypeOptions,
    innovationStageOptions,
    Workload,
    WorkloadFormValues,
    workloadFormSchema,
    defaultFormValues,
} from "@/lib/types/workload"

export default function WorkloadEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ returnUrl?: string }>
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const resolvedSearchParams = use(searchParams)
  const [workload, setWorkload] = useState<Workload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStudent, setIsStudent] = useState(false)
  const [reviewers, setReviewers] = useState<Array<{ id: number; username: string }>>([])

  // 从本地存储获取用户角色
  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    setIsStudent(userRole === 'student')
  }, [])

  // 获取审核人列表
  useEffect(() => {
    if (!isStudent) return // 如果不是学生，不需要获取审核人列表

    const fetchReviewers = async () => {
      try {
        const response = await api.get("/user/list/")
        // 筛选出导师角色的用户
        const mentors = response.data.filter((user: any) => user.role === "mentor")
        setReviewers(mentors)
      } catch (error) {
        console.error("获取审核人列表失败:", error)
        toast.error("获取审核人列表失败", {
          description: "请刷新页面重试",
          duration: 3000,
        })
      }
    }

    fetchReviewers()
  }, [isStudent])

  // 初始化表单
  const form = useForm<WorkloadFormValues>({
    resolver: zodResolver(workloadFormSchema),
    defaultValues: defaultFormValues,
  })

  // 获取工作量详情
  useEffect(() => {
    const fetchWorkload = async () => {
      try {
        const [workloadRes, reviewersRes] = await Promise.all([
          api.get(`/workload/${resolvedParams.id}/`),
          api.get("/user/list/"),
        ])

        const workload: Workload = workloadRes.data
        // 过滤出导师角色的用户
        const mentors = reviewersRes.data.filter((user: any) => user.role === "mentor")
        setReviewers(mentors)

        // 填充表单数据
        form.reset({
          name: workload.name,
          content: workload.content,
          source: workload.source,
          type: workload.work_type,
          startDate: new Date(workload.start_date),
          endDate: new Date(workload.end_date),
          intensityType: workload.intensity_type,
          intensityValue: workload.intensity_value.toString(),
          innovationStage: workload.innovation_stage || "",
          assistantSalaryPaid: workload.assistant_salary_paid?.toString() || "",
          mentor_reviewer: workload.mentor_reviewer?.id.toString() || "",
        })

        // 设置工作量数据
        setWorkload(workload)
      } catch (error: any) {
        console.error("获取数据失败:", error)
        
        if (error.response?.status === 401) {
          router.push("/login")
          return
        }
        
        toast.error("获取数据失败", {
          description: error.response?.data?.detail || "请稍后重试",
        })
        router.push("/workload/submitted")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkload()
  }, [resolvedParams.id, router, form])

  // 提交表单
  const onSubmit = async (values: WorkloadFormValues) => {
    try {
      const formData = new FormData()
      
      // 添加基本字段
      formData.append("name", values.name)
      formData.append("content", values.content)
      formData.append("source", values.source)
      formData.append("work_type", values.type)
      formData.append("start_date", format(values.startDate, "yyyy-MM-dd"))
      formData.append("end_date", format(values.endDate, "yyyy-MM-dd"))
      formData.append("intensity_type", values.intensityType)
      formData.append("intensity_value", values.intensityValue)

     if (values.source === "innovation" && values.innovationStage) {
        formData.append("innovation_stage", values.innovationStage)
      }
      if (values.source === "assistant" && values.assistantSalaryPaid) {
        formData.append("assistant_salary_paid", values.assistantSalaryPaid)
      }
      
      if (isStudent && values.mentor_reviewer) {
        formData.append("mentor_reviewer_id", values.mentor_reviewer)
      }

      // 添加文件（如果有）
      if (values.attachments) {
        formData.append("attachments", values.attachments)
      }

      await api.put(`/workload/${resolvedParams.id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast.success("保存成功")
      
      // 如果有returnUrl参数，则返回到指定页面，否则返回到已提交工作量页面
      if (resolvedSearchParams.returnUrl) {
        router.push(resolvedSearchParams.returnUrl)
      } else {
        router.push("/workload/submitted")
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
                router.push("/workload/submitted")
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
                  router.push("/workload/submitted")
                }
              }}
              className="h-9 w-9 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">编辑工作量</h3>
              <p className="text-sm text-muted-foreground mt-1">修改工作量信息</p>
            </div>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">工作量信息</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-500">工作量名称</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入工作量名称" className="h-10" {...field} />
                        </FormControl>
                        <FormMessage className="empty:hidden" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-500">工作内容</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="请输入工作内容"
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="empty:hidden" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-500">工作量来源</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="请选择工作量来源" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sourceOptions.map((option) => (
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
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-500">工作类型</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="请选择工作类型" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {typeOptions.map((option) => (
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
                    {/* 大创阶段 */}
                  {form.watch("source") === "innovation" && (
                    <FormField
                        control={form.control}
                        name="innovationStage"
                        render={({ field }) => (
                          <FormItem>
                          <FormLabel>大创阶段</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="请选择大创阶段" />
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {innovationStageOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}

                  {/* 助教工资 */}
                  {form.watch("source") === "assistant" && (
                    <FormField control={form.control} name="assistantSalaryPaid" render={({ field }) => (
                      <FormItem>
                        <FormLabel>已发助教工资</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}

                    <FormField
                      control={form.control}
                      name="startDate"
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
                              disabledDate={(current) => {
                                return current && (current > dayjs() || current < dayjs("1900-01-01"))
                              }}
                            />
                          </FormControl>
                          <FormMessage className="empty:hidden" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm font-medium text-gray-500">结束日期</FormLabel>
                          <FormControl>
                            <DatePicker
                              className="w-full h-10"
                              placeholder="选择日期"
                              format="YYYY年MM月DD日"
                              value={field.value ? dayjs(field.value) : null}
                              onChange={(date) => {
                                field.onChange(date ? date.toDate() : null)
                              }}
                              disabledDate={(current) => {
                                return current && (current > dayjs() || current < dayjs("1900-01-01"))
                              }}
                            />
                          </FormControl>
                          <FormMessage className="empty:hidden" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intensityType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-500">工作强度类型</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="请选择工作强度类型" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {intensityTypeOptions.map((option) => (
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
                      name="intensityValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-500">工作强度值</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="请输入工作强度值"
                              className="h-10"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="empty:hidden" />
                        </FormItem>
                      )}
                    />

                    {isStudent && (
                      <FormField
                        control={form.control}
                        name="mentor_reviewer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-500">审核导师</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="请选择审核导师" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {reviewers.map((reviewer) => (
                                  <SelectItem
                                    key={reviewer.id}
                                    value={reviewer.id.toString()}
                                    className="cursor-pointer hover:bg-gray-100"
                                  >
                                    {reviewer.username}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="empty:hidden" />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="attachments"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-500">证明材料</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <Input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    // 检查文件大小（10MB）
                                    const isLt10M = file.size / 1024 / 1024 < 10
                                    if (!isLt10M) {
                                      toast.error("文件过大", {
                                        description: "文件大小不能超过10MB",
                                        duration: 3000,
                                      })
                                      return
                                    }

                                    // 检查文件类型
                                    const allowedTypes = [
                                      'image/jpeg',
                                      'image/png',
                                      'image/gif',
                                      'application/pdf',
                                      'application/msword',
                                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                      'application/vnd.ms-excel',
                                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                    ]
                                    
                                    if (!allowedTypes.includes(file.type)) {
                                      toast.error("文件类型不支持", {
                                        description: "请上传常见的文档格式或图片格式",
                                        duration: 3000,
                                      })
                                      return
                                    }

                                    onChange(file)
                                  }
                                }}
                                className="h-10 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                {...field}
                              />
                              {workload?.attachments_url && (
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <span>当前文件：</span>
                                  <a
                                    href={workload.attachments_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 hover:underline"
                                    download={workload.original_filename || undefined}
                                  >
                                    {workload.original_filename || '下载附件'}
                                  </a>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            支持常见的文档格式和图片格式，单个文件大小不超过10MB
                          </FormDescription>
                          <FormMessage className="empty:hidden" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (resolvedSearchParams.returnUrl) {
                          router.push(resolvedSearchParams.returnUrl)
                        } else {
                          router.push("/workload/submitted")
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