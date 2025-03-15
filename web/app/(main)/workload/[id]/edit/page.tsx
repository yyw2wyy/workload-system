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

// 工作量来源选项
const sourceOptions = [
  { value: "horizontal", label: "横向" },
  { value: "innovation", label: "大创" },
  { value: "hardware", label: "硬件小组" },
  { value: "assessment", label: "考核小组" },
]

// 工作类型选项
const typeOptions = [
  { value: "remote", label: "远程" },
  { value: "onsite", label: "实地" },
]

// 工作强度类型选项
const intensityTypeOptions = [
  { value: "total", label: "总计" },
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每周" },
]

// 表单验证模式
const formSchema = z
  .object({
    name: z.string().min(1, "请输入工作量名称"),
    content: z.string().min(1, "请输入工作内容"),
    source: z.enum(["horizontal", "innovation", "hardware", "assessment"], {
      required_error: "请选择工作量来源",
    }),
    work_type: z.enum(["remote", "onsite"], {
      required_error: "请选择工作类型",
    }),
    start_date: z.date({
      required_error: "请选择开始日期",
    }),
    end_date: z.date({
      required_error: "请选择结束日期",
    }),
    intensity_type: z.enum(["total", "daily", "weekly"], {
      required_error: "请选择工作强度类型",
    }),
    intensity_value: z.coerce
      .number()
      .min(0.1, "工作强度必须大于0")
      .max(24, "工作强度不能超过24"),
    mentor_reviewer_id: z.string().min(1, "请选择审核导师"),
    image: z.any().optional(),
    file: z.any().optional(),
  })
  .refine(
    (data) => {
      return data.end_date >= data.start_date
    },
    {
      message: "结束日期不能早于开始日期",
      path: ["end_date"],
    }
  )

type FormValues = z.infer<typeof formSchema>

// 工作量类型定义
type Workload = {
  id: number
  name: string
  content: string
  source: "horizontal" | "innovation" | "hardware" | "assessment"
  work_type: "remote" | "onsite"
  start_date: string
  end_date: string
  intensity_type: "total" | "daily" | "weekly"
  intensity_value: number
  image_path: string | null
  file_path: string | null
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
  status: string
}

export default function WorkloadEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const resolvedParams = use(params)
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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      content: "",
      source: "horizontal",
      work_type: "remote",
      intensity_type: "total",
      intensity_value: 1,
      mentor_reviewer_id: "",
    },
  })

  // 获取工作量详情
  useEffect(() => {
    const fetchWorkload = async () => {
      try {
        const [workloadRes, reviewersRes] = await Promise.all([
          api.get(`/workload/${resolvedParams.id}/`),
          api.get("/user/list/"),
        ])

        const workload = workloadRes.data
        // 过滤出导师角色的用户
        const mentors = reviewersRes.data.filter((user: any) => user.role === "mentor")
        setReviewers(mentors)

        // 填充表单数据
        form.reset({
          name: workload.name,
          content: workload.content,
          source: workload.source,
          work_type: workload.work_type,
          start_date: new Date(workload.start_date),
          end_date: new Date(workload.end_date),
          intensity_type: workload.intensity_type,
          intensity_value: workload.intensity_value,
          mentor_reviewer_id: workload.mentor_reviewer?.id.toString() || "",
        })
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
  const onSubmit = async (values: FormValues) => {
    try {
      const formData = new FormData()
      
      // 添加基本字段
      formData.append("name", values.name)
      formData.append("content", values.content)
      formData.append("source", values.source)
      formData.append("work_type", values.work_type)
      formData.append("start_date", format(values.start_date, "yyyy-MM-dd"))
      formData.append("end_date", format(values.end_date, "yyyy-MM-dd"))
      formData.append("intensity_type", values.intensity_type)
      formData.append("intensity_value", values.intensity_value.toString())
      formData.append("mentor_reviewer_id", values.mentor_reviewer_id)

      // 添加文件（如果有）
      if (values.image instanceof File) {
        formData.append("image", values.image)
      }
      if (values.file instanceof File) {
        formData.append("file", values.file)
      }

      await api.put(`/workload/${resolvedParams.id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast.success("修改成功")
      router.push("/workload/submitted")
    } catch (error: any) {
      console.error("修改失败:", error)
      toast.error("修改失败", {
        description: error.response?.data?.detail || "请稍后重试",
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
            onClick={() => router.push("/workload/submitted")}
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
      <div className="container mx-auto py-10">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/workload/submitted")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-medium">编辑工作量</h3>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>工作量信息</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>工作量名称</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入工作量名称" {...field} />
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
                        <FormLabel>工作内容</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="请输入工作内容"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="empty:hidden" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>工作量来源</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="请选择工作量来源" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sourceOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
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
                      name="work_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>工作类型</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="请选择工作类型" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {typeOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
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
                      name="start_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>开始日期</FormLabel>
                          <FormControl>
                            <DatePicker
                              className="w-full"
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
                      name="end_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>结束日期</FormLabel>
                          <FormControl>
                            <DatePicker
                              className="w-full"
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
                      name="intensity_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>工作强度类型</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="请选择工作强度类型" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {intensityTypeOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
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
                      name="intensity_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>工作强度值</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="请输入工作强度值"
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
                        name="mentor_reviewer_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>审核导师</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="请选择审核导师" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {reviewers.map((reviewer) => (
                                  <SelectItem
                                    key={reviewer.id}
                                    value={reviewer.id.toString()}
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

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>图片上传</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                onChange(file)
                              }}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="empty:hidden" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="file"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>文件上传</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                onChange(file)
                              }}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="empty:hidden" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/workload/submitted")}
                    >
                      取消
                    </Button>
                    <Button type="submit">保存修改</Button>
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