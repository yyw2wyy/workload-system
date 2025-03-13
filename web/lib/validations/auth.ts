import * as z from "zod"
import { UserRole } from "../types/auth"

export const loginSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(6, "密码至少需要6个字符"),
})

export const registerSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(6, "密码至少需要6个字符"),
  confirmPassword: z.string().min(6, "密码至少需要6个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  role: z.enum(["student", "teacher", "mentor"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
}) 