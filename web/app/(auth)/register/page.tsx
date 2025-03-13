"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { registerSchema } from "@/lib/validations/auth"
import { useAuthStore } from "@/lib/store/auth"
import type { RegisterCredentials } from "@/lib/types/auth"

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
    } catch (err: any) {
      console.error("Register error:", err)
      setError(
        err.response?.data?.detail || 
        err.response?.data?.message || 
        err.message || 
        "注册失败，请检查输入信息是否正确"
      )
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