"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

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
  image: z.any().optional(),
  file: z.any().optional(),
  reviewer: z.string().min(1, "请选择审核人"),
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

export default function WorkloadSubmitPage() {
  const form = useForm<WorkloadFormValues>({
    resolver: zodResolver(workloadFormSchema),
    defaultValues,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(data: WorkloadFormValues) {
    try {
      setIsSubmitting(true)
      
      // TODO: 调用后端 API 提交工作量
      console.log(data)
      
      toast.success("工作量提交成功", {
        description: "您的工作量已成功提交，等待审核",
        duration: 3000,
      })
      
      form.reset()
    } catch (error) {
      console.error("提交工作量失败:", error)
      toast.error("提交失败", {
        description: "提交工作量时发生错误，请稍后重试",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
                  <FormDescription>
                    简要描述此工作量的名称
                  </FormDescription>
                  <FormMessage />
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
                  <FormDescription>
                    详细描述此工作量的具体内容
                  </FormDescription>
                  <FormMessage />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>工作量类型</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormMessage />
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "yyyy-MM-dd")
                            ) : (
                              <span>选择日期</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>结束日期</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "yyyy-MM-dd")
                            ) : (
                              <span>选择日期</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormMessage />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="image"
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="file"
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
                    <FormMessage />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择审核人" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* TODO: 从后端获取审核人列表 */}
                      <SelectItem value="reviewer1">审核人1</SelectItem>
                      <SelectItem value="reviewer2">审核人2</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "提交中..." : "提交"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
} 