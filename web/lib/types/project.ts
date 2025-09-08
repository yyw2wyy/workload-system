import * as z from "zod"

// 项目状态映射
export const projectStatusMap = {
  pre_research: '预研',
  in_research: '在研',
} as const

// 审批状态映射
export const reviewStatusMap = {
  pending: '审批中',
  rejected: '已驳回',
  approved: '已通过',
} as const

// 表单选项
export const statusOptions = [
  { value: "pre_research", label: "预研" },
  { value: "in_research", label: "在研" },
] as const

// 类型定义
export type ProjectStatus = keyof typeof projectStatusMap

export interface Project {
  id: number
  name: string
  status: ProjectStatus
  start_time: string
  created_at: string
  teacher_reviewer: {
    id: number
    username: string
    role: string
  } | null
}

// 表单验证模式
export const projectFormSchema = z.object({
  name: z.string().min(1, "请输入项目名称"),
  status: z.enum(Object.keys(projectStatusMap) as [ProjectStatus, ...ProjectStatus[]], {
    required_error: "请选择项目状态",
  }),
  startDate: z.date({
    required_error: "请选择项目开始日期",
  }),
  teacher_reviewer: z.string().optional(),
})

// 表单类型定义
export type ProjectFormValues = z.infer<typeof projectFormSchema>

// 表单默认值
export const defaultFormValues: Partial<ProjectFormValues> = {
  name: "",
  status: "" as ProjectStatus,
  teacher_reviewer: "梁红茹"
}