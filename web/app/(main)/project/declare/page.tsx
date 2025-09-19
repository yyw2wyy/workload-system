"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Upload } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { api } from "@/lib/axios"
import {DatePicker, ConfigProvider, Select as AntdSelect} from "antd"
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
import {useAuthStore} from "@/lib/store/auth";

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

  const [allUsers, setAllUsers] = useState<Reviewer[]>([]);
  const authUser = useAuthStore((state) => state.user);

  // 从本地存储获取用户角色
  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    setIsStudent(userRole === 'student')
    setIsTeacher(userRole === 'teacher')
  }, [])

  // 获取所有非老师用户（并根据身份初始化 shares）
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/user/list/");

        // 获取所有非老师用户
        const users = response.data.filter((u: Reviewer) => u.role !== "teacher");
        setAllUsers(users);

        if (isTeacher) {
          // 老师不需要加入自己，使用空数组（之前用 {} 导致缺少 user 字段的 TS2741 错误）
          form.setValue("shares", []);
        } else if (authUser) {
          // 确保 authUser 已就绪再使用 authUser.id，避免 TS18047（可能为 null）
          const submitterShare = {
            user: authUser.id,
          };
          form.setValue("shares", [submitterShare]);
        } else {
          // authUser 尚未初始化，不在此处设置 shares，让下面的 effect 在 authUser 可用时处理
        }

      } catch (error) {
        toast.error("获取用户列表失败", { duration: 3000 });
      }
    };
    fetchUsers();
  }, [authUser, form, isTeacher]);

  async function onSubmit(data: ProjectFormValues) {
    try {
      console.log("准备提交")
      setIsSubmitting(true);

      // 准备表单数据
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("project_status", data.project_status);
      formData.append("start_date", format(data.start_date, "yyyy-MM-dd"));
      formData.append("shares", JSON.stringify(data.shares));


      // 老师不需要审核
      if (isTeacher) {
        formData.append("review_status", "approved")
      }


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
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="start_date"
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

                <FormField
                    control={form.control}
                    name="shares"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">参与人</FormLabel>
                        <div className="space-y-4">
                          {field.value?.map((participate, index) => {
                            const userObj = allUsers.find((u) => u.id === participate.user);
                            const isSubmitter = participate.user === authUser?.id;

                            return (
                              <div key={index} className="flex items-center space-x-4">
                                {/* 用户选择（申请人不可改） */}
                                <AntdSelect
                                  showSearch
                                  style={{ width: 200 }}
                                  placeholder="选择参与人"
                                  optionFilterProp="label"
                                  value={participate.user || undefined}
                                  disabled={isSubmitter && !isTeacher}
                                  onChange={(val) => {
                                    const updated = [...field.value]
                                    updated[index].user = Number(val)
                                    field.onChange(updated)
                                  }}
                                  filterOption={(input, option) =>
                                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                                  }
                                  options={allUsers
                                    .filter((user) => {
                                      // 过滤掉已经选择的用户（排除自己和当前行）
                                      const isAlreadySelected = field.value.some(
                                        (s, i) => s.user === user.id && i !== index
                                      );
                                      return !isAlreadySelected;
                                    })
                                    .map((user) => ({
                                      label: user.username,
                                      value: user.id,
                                    }))}
                                />

                                {/* 删除按钮（申请人不可删） */}
                                {!isSubmitter && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                      const updated = field.value.filter((_, i) => i !== index);
                                      field.onChange(updated);
                                    }}
                                  >
                                    删除
                                  </Button>
                                )}
                              </div>
                            );
                          })}

                          {/* 添加参与人按钮 */}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const updated = field.value ? [...field.value] : [];
                              updated.push({ user: 0});
                              field.onChange(updated);
                            }}
                          >
                            添加参与人
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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