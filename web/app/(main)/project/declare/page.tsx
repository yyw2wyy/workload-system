"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Upload } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { api } from "@/lib/axios"
import { DatePicker, ConfigProvider } from "antd"
import dayjs from "dayjs"
import zhCN from "antd/locale/zh_CN"
import "dayjs/locale/zh-cn"
import "antd/dist/reset.css"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

import {
  projectFormSchema,
  ProjectFormValues,
  defaultFormValues,
  statusOptions,
} from "@/lib/types/project"

type Reviewer = {
  id: number
  username: string
  role: string
}

export default function WorkloadDeclarePage() {
  const router = useRouter()
  const [isStudent, setIsStudent] = useState(false)
  const [isTeacher, setIsTeacher] = useState(false)
  // const form = useForm<WorkloadFormValues>({
  //   resolver: zodResolver(workloadFormSchema),
  //   defaultValues: defaultFormValues,
  // })
    const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: defaultFormValues,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [fileList, setFileList] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 默认审核教师
  const teacher_reviewer = "梁红茹"

  // 从本地存储获取用户角色
  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    setIsStudent(userRole === 'student')
    setIsTeacher(userRole === 'teacher')
  }, [])

  async function onSubmit(data: ProjectFormValues) {
    try {
      setIsSubmitting(true);

      // 准备表单数据
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("project_status", data.status);
      formData.append("start_date", format(data.startDate, "yyyy-MM-dd"));

      // 只有学生才需要提供审核导师
      if (isStudent) {
        formData.append("teacher_reviewer", teacher_reviewer);
      }

      // 老师不需要审核
      if (isTeacher) {
        formData.append("review_status", "approved")
      }

      // 输出FormData内容以供调试
      console.log("提交的数据：", {
        name: data.name,
        status: data.status,
        start_date: format(data.startDate, "yyyy-MM-dd"),
      });

      // 调用后端 API
      const response = await api.post("/project/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // 添加超时设置
        timeout: 60000, // 60秒
      });

      // 检查响应
      console.log("提交成功，响应：", response.data);

      if (isTeacher) {
        toast.success("项目申报成功", {
          description: "您的项目已成功申报",
          duration: 3000,
        });
      } else {
        toast.success("项目申报成功", {
          description: "您的项目已成功申报，等待审核",
          duration: 3000,
        });
      }


      // 重置表单并清空文件列表
      form.reset(defaultFormValues);
    } catch (error: any) {
      console.error("项目申报失败:", error);

      // 详细记录错误信息
      if (error.response) {
        console.error("错误响应:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });

        // 服务器返回的错误信息
        let errorMessage = "申报项目时发生错误，请稍后重试";

        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (typeof error.response.data === 'object') {
            // 处理字段错误
            const fieldErrors = [];
            for (const [key, value] of Object.entries(error.response.data)) {
              fieldErrors.push(`${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
            }
            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join('\n');
            }
          }
        }

        toast.error("申报失败", {
          description: errorMessage,
          duration: 5000,
        });
      } else if (error.request) {
        // 请求发送失败
        console.error("请求错误:", {
          request: error.request,
          message: error.message,
        });

        toast.error("提交失败", {
          description: "网络连接错误，请检查您的网络连接",
          duration: 5000,
        });
      } else {
        // 其他错误
        console.error("其他错误:", error.message);

        toast.error("提交失败", {
          description: "申报项目时发生错误，请稍后重试",
          duration: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ConfigProvider locale={zhCN}>
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold tracking-tight">项目申报</h3>
            <p className="text-sm text-muted-foreground">
              申报项目，申报后等待审核
            </p>
          </div>
          <Card className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">项目名称</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="请输入项目名称"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage className="empty:hidden" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="status"
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
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-base">开始日期</FormLabel>
                        <FormControl>
                          <DatePicker
                            className="w-full h-11"
                            placeholder="选择日期"
                            format="YYYY年MM月DD日"
                            value={field.value ? dayjs(field.value) : null}
                            onChange={(date) => {
                              field.onChange(date ? date.toDate() : null)
                            }}
                            // disabledDate={(current) => {
                            //   return current && (current > dayjs() || current < dayjs("1900-01-01"))
                            // }}
                          />
                        </FormControl>
                        <FormMessage className="empty:hidden" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-[120px] border border-red-600"
                  >
                    {isSubmitting ? "提交中..." : "提交"}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </ConfigProvider>
  )
}