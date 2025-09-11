import * as z from "zod"

// 工作量来源映射
export const sourceMap = {
  horizontal: "横向",
  innovation: "大创",
  hardware: "硬件小组",
  assessment: "考核小组",
  documentation: "材料撰写",
  assistant: "助教",
  other: "其他",
} as const

// 大创阶段映射
export const innovationStageMap = {
  before: "立项前",
  after: "立项后",
} as const

// 工作类型映射
export const typeMap = {
  remote: "远程",
  onsite: "实地",
} as const

// 工作强度类型映射
export const intensityTypeMap = {
  total: "总计",
  daily: "每天",
  weekly: "每周",
} as const

// 状态映射
export const statusMap = {
  pending: "待审核",
  mentor_approved: "导师已审核",
  teacher_approved: "教师已审核",
  mentor_rejected: "导师已驳回",
  teacher_rejected: "教师已驳回",
} as const

// 审核结果选项
export const reviewOptions = [
  { value: "approved", label: "通过" },
  { value: "rejected", label: "拒绝" },
] as const

// 表单选项
export const sourceOptions = [
  { value: "horizontal", label: "横向" },
  { value: "innovation", label: "大创" },
  { value: "hardware", label: "硬件小组" },
  { value: "assessment", label: "考核小组" },
  { value: "documentation", label: "材料撰写" },
  { value: "assistant", label: "助教" },
  { value: "other", label: "其他" },
] as const

export const innovationStageOptions = [
  { value: "before", label: "立项前" },
  { value: "after", label: "立项后" },
] as const

export const typeOptions = [
  { value: "remote", label: "远程" },
  { value: "onsite", label: "实地" },
] as const

export const intensityTypeOptions = [
  { value: "total", label: "总计" },
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每周" },
] as const

export type WorkloadShare = {
  user: number
  user_info: {
    id: number
    username: string
    role: string
  }
  percentage: number
}

// 项目简化类型
export type ProjectSimple = {
  id: number
  name: string
}

// 类型定义
export type WorkloadSource = keyof typeof sourceMap
export type InnovationStage = keyof typeof innovationStageMap
export type WorkloadType = keyof typeof typeMap
export type IntensityType = keyof typeof intensityTypeMap
export type WorkloadStatus = keyof typeof statusMap
export type ReviewOption = typeof reviewOptions[number]

// 工作量类型定义
export type Workload = {
  id: number
  name: string
  content: string
  source: WorkloadSource
  work_type: WorkloadType
  start_date: string
  end_date: string
  intensity_type: IntensityType
  intensity_value: number
  innovation_stage: InnovationStage | null
  assistant_salary_paid: number | null
  attachments: string | null
  attachments_url: string | null
  original_filename: string | null
  submitter: {
    id: number
    username: string
    role: string
  }
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
  status: WorkloadStatus
  mentor_comment: string | null
  mentor_review_time: string | null
  teacher_comment: string | null
  teacher_review_time: string | null
  created_at: string
  updated_at: string
  shares?: WorkloadShare[]
  project?: ProjectSimple | null
  project_id?: number | null
}

// 表单验证模式
export const workloadFormSchema = z.object({
  name: z.string().min(1, "请输入工作量名称"),
  content: z.string().min(1, "请输入工作量内容"),
  source: z.enum(Object.keys(sourceMap) as [WorkloadSource, ...WorkloadSource[]], {
    required_error: "请选择工作量来源",
  }),
  type: z.enum(Object.keys(typeMap) as [WorkloadType, ...WorkloadType[]], {
    required_error: "请选择工作类型",
  }),
  startDate: z.date({
    required_error: "请选择开始日期",
  }),
  endDate: z.date({
    required_error: "请选择结束日期",
  }),
  intensityType: z.enum(Object.keys(intensityTypeMap) as [IntensityType, ...IntensityType[]], {
    required_error: "请选择工作强度类型",
  }),
  intensityValue: z.string().min(1, "请输入工作强度值"),
  innovationStage: z.string().optional(),
  assistantSalaryPaid: z.string().optional(),
  attachments: z.any().optional(),
  mentor_reviewer: z.string().optional(),
  shares: z
    .array(
      z.object({
        user: z.number({ required_error: "请选择参与人" }),
        percentage: z.number({ required_error: "请输入占比" }).min(0).max(100),
      })
    )
   .default([]),
  project_id: z.number().nullable().optional(),
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true
  return data.endDate >= data.startDate
}, {
  message: "结束日期不能早于开始日期",
  path: ["endDate"],
}).refine((data) => {
  if (!data.endDate || data.source !== "documentation") return true
  const today = new Date()
  const diffTime = today.getTime() - data.endDate.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  return diffDays <= 30
}, {
  message: "材料撰写必须在完成后1个月内申报",
  path: ["endDate"],
}).refine((data) => {
  if (data.source !== "innovation") return true
  return !!data.innovationStage
}, {
  message: "请选择大创阶段",
  path: ["innovationStage"],
})
.refine((data) => {
  if (data.source !== "assistant") return true
  return !!data.assistantSalaryPaid && !isNaN(Number(data.assistantSalaryPaid))
}, {
  message: "请输入已发助教工资（整数）",
  path: ["assistantSalaryPaid"],
}).refine((data) => {
  if (data.source !== "innovation") return true
  if (!data.shares || data.shares.length === 0) return false
  const total = data.shares.reduce((sum, s) => sum + s.percentage, 0)
  return Math.abs(total - 100) < 1e-6
}, {
  message: "大创类工作量的占比总和必须为100",
  path: ["shares"],
}).refine((data) => {
  if (["horizontal"].includes(data.source)) return !!data.project_id
  return true
}, {
  message: "请选择关联项目",
  path: ["project_id"],
})

// 表单类型定义
export type WorkloadFormValues = z.infer<typeof workloadFormSchema>

// 表单默认值
export const defaultFormValues: Partial<WorkloadFormValues> = {
  name: "",
  content: "",
  source: "" as WorkloadSource,
  type: "" as WorkloadType,
  intensityType: "" as IntensityType,
  intensityValue: "",
  innovationStage: "",
  assistantSalaryPaid: "",
  mentor_reviewer: "",
  shares: [],
  project_id: null,
} 