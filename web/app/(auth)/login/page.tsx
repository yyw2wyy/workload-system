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
import { cn } from "@/lib/utils"

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
    <div className="min-h-screen bg-gray-50/30">
      <div className="flex flex-col items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="relative bg-white shadow-xl rounded-2xl px-8 py-12">
            {/* 标题区域 */}
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                欢迎回来
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                还没有账号？{" "}
                <Link 
                  href="/register" 
                  className="font-medium text-primary hover:text-primary/90 transition-colors"
                >
                  立即注册
                </Link>
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 角色选择 */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        {roleOptions.map((option) => (
                          <Button
                            key={option.value}
                            type="button"
                            onClick={() => field.onChange(option.value)}
                            className={cn(
                              "h-11 px-4 transition-all",
                              field.value === option.value
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-gray-50/80 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          用户名
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="请输入用户名" 
                            className="h-11 px-4 bg-gray-50/50"
                            {...field} 
                          />
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
                        <FormLabel className="text-sm font-medium text-gray-700">
                          密码
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="请输入密码" 
                            className="h-11 px-4 bg-gray-50/50"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium transition-all hover:opacity-90"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "登录中..." : "登录"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
} 