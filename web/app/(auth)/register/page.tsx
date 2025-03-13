"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

import { registerSchema } from "@/lib/validations/auth"
import { useAuthStore } from "@/lib/store/auth"
import type { RegisterCredentials } from "@/lib/types/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const [error, setError] = useState<string>("")
  const router = useRouter()
  const { register: registerUser } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterCredentials) => {
    try {
      setError("")
      await registerUser(data)
      router.push("/")
      toast.success('注册成功！请登录', {
        position: "top-center",
        duration: 3000,
      })
    } catch (err: any) {
      console.error("Register error:", err)
      const errorData = err.response?.data || {}
      
      // 错误信息翻译映射
      const errorTranslations: Record<string, string> = {
        "This password is too short. It must contain at least 8 characters.": "密码太短。密码长度必须至少为8个字符。",
        "This password is too common.": "密码太常见，请使用更复杂的密码。",
        "This password is entirely numeric.": "密码不能全为数字，请包含字母或特殊字符。",
        "The two password fields didn't match.": "两次输入的密码不一致。",
        "A user with that username already exists.": "该用户名已被注册。"
      }

      // 收集所有错误信息
      const errors: { fieldName: string; message: string }[] = []
      
      Object.entries(errorData).forEach(([field, fieldErrors]) => {
        if (Array.isArray(fieldErrors)) {
          fieldErrors.forEach((error: string) => {
            let fieldName = field
            switch (field) {
              case 'username':
                fieldName = '用户名'
                break
              case 'password':
                fieldName = '密码'
                break
              case 'confirm_password':
                fieldName = '确认密码'
                break
              case 'email':
                fieldName = '邮箱'
                break
            }
            
            // 翻译错误信息
            const translatedError = errorTranslations[error] || error
            errors.push({
              fieldName,
              message: translatedError
            })
          })
        }
      })

      // 按顺序显示错误信息
      const showNextError = (index: number) => {
        if (index < errors.length) {
          const error = errors[index]
          toast.error(`${error.fieldName}：${error.message}`, {
            duration: 1500,
            position: "top-center",
          })
          // 1.5秒后显示下一个错误
          setTimeout(() => showNextError(index + 1), 1500)
        }
      }

      // 开始显示第一个错误
      if (errors.length > 0) {
        showNextError(0)
      } else {
        // 如果没有具体的错误信息，显示通用错误
        toast.error("注册失败，请重试", {
          duration: 3000,
          position: "top-center",
        })
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">注册账号</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            已有账号？{" "}
            <Link href="/login" className="text-primary hover:underline">
              登录
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium">
                用户名
              </label>
              <input
                id="username"
                type="text"
                {...register("username")}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
                placeholder="请输入用户名"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
                placeholder="请输入邮箱"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                密码
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
                placeholder="请输入密码"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password2" className="block text-sm font-medium">
                确认密码
              </label>
              <input
                id="password2"
                type="password"
                {...register("password2")}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
                placeholder="请再次输入密码"
              />
              {errors.password2 && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password2.message}
                </p>
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? "注册中..." : "注册"}
          </button>
        </form>
      </div>
    </div>
  )
} 