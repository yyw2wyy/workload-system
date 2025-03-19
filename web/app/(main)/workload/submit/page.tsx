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
import { Button } from "@/components/ui/button"
import {
  workloadFormSchema,
  WorkloadFormValues,
  defaultFormValues,
  sourceOptions,
  typeOptions,
  intensityTypeOptions
} from "@/lib/types/workload"

type Reviewer = {
  id: number
  username: string
  role: string
}

export default function WorkloadSubmitPage() {
  const router = useRouter()
  const [isStudent, setIsStudent] = useState(false)
  const form = useForm<WorkloadFormValues>({
    resolver: zodResolver(workloadFormSchema),
    defaultValues: defaultFormValues,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [fileList, setFileList] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  }, [isStudent])

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
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

      setFileList([file])
    }
  }

  // 处理文件移除
  const handleFileRemove = () => {
    setFileList([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function onSubmit(data: WorkloadFormValues) {
    try {
      setIsSubmitting(true);
      
      // 准备表单数据
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("content", data.content);
      formData.append("source", data.source);
      formData.append("work_type", data.type);
      formData.append("start_date", format(data.startDate, "yyyy-MM-dd"));
      formData.append("end_date", format(data.endDate, "yyyy-MM-dd"));
      formData.append("intensity_type", data.intensityType);
      formData.append("intensity_value", data.intensityValue);
      
      // 只有学生才需要提供审核导师
      if (isStudent && data.mentor_reviewer) {
        formData.append("mentor_reviewer_id", data.mentor_reviewer);
      }

      // 添加文件（如果有）
      if (fileList.length > 0) {
        const file = fileList[0];
        formData.append("attachments", file, file.name);
      }

      // 输出FormData内容以供调试
      console.log("提交的数据：", {
        name: data.name,
        content: data.content,
        source: data.source,
        work_type: data.type,
        start_date: format(data.startDate, "yyyy-MM-dd"),
        end_date: format(data.endDate, "yyyy-MM-dd"),
        intensity_type: data.intensityType,
        intensity_value: data.intensityValue,
        mentor_reviewer_id: isStudent ? data.mentor_reviewer : null,
        attachments: fileList.length > 0 ? fileList[0].name : null,
      });

      // 调用后端 API
      const response = await api.post("/workload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // 添加超时设置
        timeout: 60000, // 60秒
      });
      
      // 检查响应
      console.log("提交成功，响应：", response.data);
      
      toast.success("工作量提交成功", {
        description: "您的工作量已成功提交，等待审核",
        duration: 3000,
      });
      
      // 重置表单并清空文件列表
      form.reset(defaultFormValues);
      setFileList([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error: any) {
      console.error("提交工作量失败:", error);
      
      // 详细记录错误信息
      if (error.response) {
        console.error("错误响应:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });
        
        // 服务器返回的错误信息
        let errorMessage = "提交工作量时发生错误，请稍后重试";
        
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
        
        toast.error("提交失败", {
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
          description: "提交工作量时发生错误，请稍后重试",
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
            <h3 className="text-2xl font-semibold tracking-tight">提交工作量</h3>
            <p className="text-sm text-muted-foreground">
              填写工作量信息，提交后等待审核
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
                      <FormLabel className="text-base">工作量名称</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="请输入工作量名称" 
                          {...field} 
                          className="h-11"
                        />
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
                      <FormLabel className="text-base">工作量内容</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="请详细描述工作量内容"
                          className="min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="empty:hidden" />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">工作量来源</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
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
                        <FormLabel className="text-base">工作量类型</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="请选择工作量类型" />
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
                        <FormLabel className="text-base">结束日期</FormLabel>
                        <FormControl>
                          <DatePicker
                            className="w-full h-11"
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
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="intensityType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">工作强度类型</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
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
                        <FormLabel className="text-base">工作强度值</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="请输入工作强度值" 
                            className="h-11"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="empty:hidden" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormItem>
                  <FormLabel className="text-base">证明材料</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        选择文件
                      </Button>
                      {fileList.length > 0 && (
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <span className="text-sm truncate">{fileList[0].name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleFileRemove}
                          >
                            移除
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    支持常见的文档格式和图片格式，单个文件大小不超过10MB
                  </FormDescription>
                </FormItem>
                {isStudent && (
                  <FormField
                    control={form.control}
                    name="mentor_reviewer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">审核导师</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
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