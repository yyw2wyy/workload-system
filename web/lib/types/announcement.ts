// 定义公告类型
export interface Announcement {
    id: number
    title: string
    content: string
    type: "notice" | "announcement" | "warning"
    created_at: string
    updated_at: string
  }