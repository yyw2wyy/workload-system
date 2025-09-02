import * as z from "zod"
import {roleMap, UserRole} from "../types/auth"

export const loginSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(6, "密码至少需要6个字符"),
  role: z.enum(Object.keys(roleMap) as [UserRole, ...UserRole[]], {
    required_error: "请选择用户角色",
  }),
})

export const registerSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(6, "密码至少需要6个字符"),
  password2: z.string().min(6, "密码至少需要6个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
}).refine((data) => data.password === data.password2, {
  message: "两次输入的密码不一致",
  path: ["password2"],
}) 