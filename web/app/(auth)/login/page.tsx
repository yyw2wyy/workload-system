"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import * as z from "zod"
import { toast } from "sonner"

import { loginSchema } from "@/lib/validations/auth"
import { useAuthStore } from "@/lib/store/auth"
import type { LoginCredentials, UserRole } from "@/lib/types/auth"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const roleOptions = [
  { value: "student", label: "学生" },
  { value: "mentor", label: "导师" },
  { value: "teacher", label: "老师" },
]

export default function LoginPage() {
  const [error, setError] = useState<string>("")
  const router = useRouter()
  const { login } = useAuthStore()

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "student",
    },
  })

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setError("")
      await login(data)
      router.push("/")
    } catch (err: any) {
      console.error("Login error:", err)
      
      // 处理角色不匹配错误
      if (err.response?.data?.role) {
        toast.error("角色错误", {
          description: "所选角色与用户角色不匹配",
        })
        return
      }
      
      // 处理其他错误
      const errorMessage = err.response?.data?.detail || 
        err.response?.data?.message || 
        err.message || 
        "登录失败，请检查用户名和密码是否正确"
      
      setError(errorMessage)
      toast.error("登录失败", {
        description: errorMessage,
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">登录</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            还没有账号？{" "}
            <Link href="/register" className="text-primary hover:underline">
              注册
            </Link>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入用户名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="请输入密码" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>角色</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择角色" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((option) => (
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

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "登录中..." : "登录"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
} 