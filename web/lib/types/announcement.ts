import {WorkloadSource} from "@/lib/types/workload";

// 定义公告类型
export interface Announcement {
    id: number
    title: string
    content: string
    type: "notice" | "announcement" | "warning"
    source?: WorkloadSource        // 新增：对应工作量来源
    created_at: string
    updated_at: string
  }