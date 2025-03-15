"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { api } from "@/lib/axios"
import { DatePicker, ConfigProvider } from "antd"
import dayjs from "dayjs"
import zhCN from "antd/locale/zh_CN"
import "dayjs/locale/zh-cn"
import "antd/dist/reset.css"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const workloadFormSchema = z.object({
  name: z.string().min(1, "请输入工作量名称"),
  content: z.string().min(1, "请输入工作量内容"),
  source: z.string().min(1, "请选择工作量来源"),
  type: z.string().min(1, "请选择工作量类型"),
  startDate: z.date({
    required_error: "请选择开始日期",
  }),
  endDate: z.date({
    required_error: "请选择结束日期",
  }),
  intensityType: z.string().min(1, "请选择工作强度类型"),
  intensityValue: z.string().min(1, "请输入工作强度值"),
  image_path: z.any().optional(),
  file_path: z.any().optional(),
  reviewer: z.string().min(1, "请选择审核人"),
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true
  return data.endDate >= data.startDate
}, {
  message: "结束日期不能早于开始日期",
  path: ["endDate"],
})

type WorkloadFormValues = z.infer<typeof workloadFormSchema>

const defaultValues: Partial<WorkloadFormValues> = {
  name: "",
  content: "",
  source: "",
  type: "",
  intensityType: "",
  intensityValue: "",
  reviewer: "",
}

const sourceOptions = [
  { value: "horizontal", label: "横向" },
  { value: "innovation", label: "大创" },
  { value: "hardware", label: "硬件小组" },
  { value: "assessment", label: "考核小组" },
]

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

type Reviewer = {
  id: number
  username: string
  role: string
}

export default function WorkloadSubmitPage() {
  const router = useRouter()
  const form = useForm<WorkloadFormValues>({
    resolver: zodResolver(workloadFormSchema),
    defaultValues,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewers, setReviewers] = useState<Reviewer[]>([])

  // 获取审核人列表
  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        const response = await api.get("/user/list/")
        // 筛选出导师角色的用户
        const mentors = response.data.filter((user: Reviewer) => user.role === "mentor")
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
  }, [])

  async function onSubmit(data: WorkloadFormValues) {
    try {
      setIsSubmitting(true)
      
      // 准备表单数据
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("content", data.content)
      formData.append("source", data.source)
      formData.append("work_type", data.type)
      formData.append("start_date", format(data.startDate, "yyyy-MM-dd"))
      formData.append("end_date", format(data.endDate, "yyyy-MM-dd"))
      formData.append("intensity_type", data.intensityType)
      formData.append("intensity_value", data.intensityValue)
      formData.append("reviewer_id", data.reviewer)

      // 添加文件（如果有）
      if (data.image_path) {
        formData.append("image_path", data.image_path)
      }
      if (data.file_path) {
        formData.append("file_path", data.file_path)
      }

      // 调用后端 API
      const response = await api.post("/workload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      
      toast.success("工作量提交成功", {
        description: "您的工作量已成功提交，等待审核",
        duration: 3000,
      })
      
      // 重置表单并刷新页面
      form.reset(defaultValues)
      router.refresh()
    } catch (error: any) {
      console.error("提交工作量失败:", error)
      
      // 处理不同类型的错误
      if (error.response) {
        // 服务器返回的错误信息
        const errorMessage = error.response.data.detail || "提交工作量时发生错误，请稍后重试"
        toast.error("提交失败", {
          description: errorMessage,
          duration: 5000,
        })
      } else if (error.request) {
        // 请求发送失败
        toast.error("提交失败", {
          description: "网络连接错误，请检查您的网络连接",
          duration: 5000,
        })
      } else {
        // 其他错误
        toast.error("提交失败", {
          description: "提交工作量时发生错误，请稍后重试",
          duration: 5000,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ConfigProvider locale={zhCN}>
      <div className="max-w-2xl mx-auto py-10">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">提交工作量</h3>
            <p className="text-sm text-muted-foreground">
              填写工作量信息，提交后等待审核
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                    <FormLabel>工作量内容</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="请详细描述工作量内容"
                        className="resize-none"
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择工作量来源" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sourceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
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
                      <FormLabel>工作量类型</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择工作量类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {typeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="empty:hidden" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
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
                  name="endDate"
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="intensityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>工作强度类型</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择工作强度类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {intensityTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
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
                      <FormLabel>工作强度值</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="请输入工作强度值" {...field} />
                      </FormControl>
                      <FormMessage className="empty:hidden" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="image_path"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>相关图片</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onChange(e.target.files?.[0])}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        可选：上传相关图片
                      </FormDescription>
                      <FormMessage className="empty:hidden" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="file_path"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>相关文件</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => onChange(e.target.files?.[0])}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        可选：上传相关文件
                      </FormDescription>
                      <FormMessage className="empty:hidden" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="reviewer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>审核人</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择审核人" />
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
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full border-2 border-black hover:text-white py-6 text-lg font-medium transition-all"
              >
                {isSubmitting ? "提交中..." : "提交"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  )
} 