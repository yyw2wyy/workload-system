import * as z from "zod"
import {WorkloadShare} from "@/lib/types/workload";

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

export const reviewOptions = [
  { value: "approved", label: "通过" },
  { value: "rejected", label: "拒绝" },
] as const

// 类型定义
export type ProjectStatus = keyof typeof projectStatusMap
export type ReviewStatus = keyof typeof reviewStatusMap

export type ProjectShare = {
  user: number
  user_info: {
    id: number
    username: string
    role: string
  }
}

export interface Project {
  id: number
  name: string
  start_date: string
  project_status: ProjectStatus
  review_status: ReviewStatus
  created_at: string
  updated_at: string
  teacher_comment: string
  teacher_review_time: string
  teacher_reviewer: {
    id: number
    username: string
    role: string
  } | null,
  submitter: {
    id: number
    username: string
    role: string
  }
  shares: ProjectShare[]
}

// 表单验证模式
export const projectFormSchema = z.object({
  name: z.string().min(1, "请输入项目名称"),
  project_status: z.enum(Object.keys(projectStatusMap) as [ProjectStatus, ...ProjectStatus[]], {
    required_error: "请选择项目状态",
  }),
  start_date: z.date({
    required_error: "请选择项目开始日期",
  }),
  teacher_reviewer: z.string().optional(),
  shares: z
    .array(
      z.object({
        user: z.number({ required_error: "请选择参与人" }),
      })
    )
   .default([]),
})

// 表单类型定义
export type ProjectFormValues = z.infer<typeof projectFormSchema>

// 表单默认值
export const defaultFormValues: Partial<ProjectFormValues> = {
  name: "",
  project_status: "" as ProjectStatus,
  teacher_reviewer: "梁红茹"
}