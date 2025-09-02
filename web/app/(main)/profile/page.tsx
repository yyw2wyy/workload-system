"use client"

import { useState } from "react"
import { useAuthStore } from "@/lib/store/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {roleMap} from "@/lib/types/auth";


export default function ProfilePage() {
  const { user, updateUser, changePassword } = useAuthStore()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm_password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 获取用户角色的显示文本
  const getRoleDisplay = (role: string) => {
    return roleMap[role.toLowerCase()] || role
  }

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateUser(formData)
      setShowEditDialog(false)
      toast.success("个人信息更新成功", {
        description: "您的个人资料已经成功更新",
        duration: 3000,
        position: "top-center",
      })
      // 使用 user 状态中的最新数据
      setFormData({
        username: user?.username || "",
        email: user?.email || "",
      })
    } catch (error: any) {
      const errorData = error.response?.data || {}
      
      // 错误信息翻译映射
      const errorTranslations: Record<string, string> = {
        'A user with that username already exists.': '该用户名已被其他用户使用',
        'A user with this email already exists.': '该邮箱已被其他用户使用',
        'Invalid email format.': '邮箱格式不正确',
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
        toast.error(error.response?.data?.message || "更新失败，请重试", {
          duration: 3000,
          position: "top-center",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirm_password) {
      toast.error("两次输入的密码不一致", {
        position: "top-center",
        duration: 3000,
      })
      return
    }

    setIsSubmitting(true)
    try {
      await changePassword(passwordForm)
      setShowPasswordDialog(false)
      toast.success("密码修改成功", {
        description: "您的密码已经成功更新，下次登录请使用新密码",
        duration: 3000,
        position: "top-center",
      })
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirm_password: "",
      })
    } catch (error: any) {
      const errorData = error.response?.data || {}
      
      // 错误信息翻译映射
      const errorTranslations: Record<string, string> = {
        'This password is too short. It must contain at least 8 characters.': '密码太短。密码长度必须至少为8个字符。',
        'This password is too common.': '密码太常见，请使用更复杂的密码。',
        'This password is entirely numeric.': '密码不能全为数字，请包含字母或特殊字符。',
        'Invalid password.': '当前密码错误',
      }

      // 处理每个字段的所有错误信息
      const errors: { fieldName: string; message: string }[] = []
      
      Object.entries(errorData).forEach(([field, fieldErrors]) => {
        if (Array.isArray(fieldErrors)) {
          fieldErrors.forEach((error: string) => {
            let fieldName = field
            switch (field) {
              case 'current_password':
                fieldName = '当前密码'
                break
              case 'new_password':
                fieldName = '新密码'
                break
              case 'confirm_password':
                fieldName = '确认密码'
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
          // 5秒后显示下一个错误
          setTimeout(() => showNextError(index + 1), 1500)
        }
      }

      // 开始显示第一个错误
      if (errors.length > 0) {
        showNextError(0)
      } else {
        // 如果没有具体的错误信息，显示通用错误
        toast.error("密码修改失败，请重试", {
          duration: 3000,
          position: "top-center",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 在对话框打开时，使用最新的用户数据
  const handleEditDialogOpen = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
    })
    setShowEditDialog(true)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/30">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gray-50/50 space-y-1">
            <CardTitle className="text-xl">个人信息</CardTitle>
            <CardDescription>查看和管理您的个人信息</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <dl className="divide-y divide-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 py-4 gap-4">
                <dt className="text-sm font-medium text-gray-500">用户名</dt>
                <dd className="text-sm text-gray-900 sm:col-span-2">
                  {user.username || '未设置'}
                </dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 py-4 gap-4">
                <dt className="text-sm font-medium text-gray-500">邮箱</dt>
                <dd className="text-sm text-gray-900 sm:col-span-2">
                  {user.email || '未设置'}
                </dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 py-4 gap-4">
                <dt className="text-sm font-medium text-gray-500">角色</dt>
                <dd className="text-sm text-gray-900 sm:col-span-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-600/20">
                    {getRoleDisplay(user.role)}
                  </span>
                </dd>
              </div>
            </dl>

            <div className="flex justify-end space-x-3 mt-8">
              <Button
                onClick={handleEditDialogOpen}
                variant="outline"
                className="h-10 px-4 hover:bg-gray-100"
              >
                更改资料
              </Button>
              <Button
                onClick={() => setShowPasswordDialog(true)}
                className="h-10 px-4"
              >
                修改密码
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 编辑资料对话框 */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl">更改资料</DialogTitle>
              <DialogDescription>
                修改您的用户名和邮箱地址
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInfoSubmit} className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">用户名</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">邮箱</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="h-10"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false)
                    setFormData({
                      username: user.username || "",
                      email: user.email || "",
                    })
                  }}
                  className="h-10 px-4 hover:bg-gray-100"
                >
                  取消
                </Button>
                <Button 
                  type="submit"
                  className="h-10 px-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "保存中..." : "保存"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* 修改密码对话框 */}
        <Dialog 
          open={showPasswordDialog} 
          onOpenChange={(open) => {
            if (!open) {
              setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirm_password: "",
              })
            }
            setShowPasswordDialog(open)
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl">修改密码</DialogTitle>
              <DialogDescription>
                更新您的账户密码，请确保密码安全
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordSubmit} className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">当前密码</Label>
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">新密码</Label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="h-10"
                    required
                    minLength={8}
                  />
                  <p className="text-sm text-gray-500">
                    密码必须至少8个字符，不能全为数字，且不能使用常见密码
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">确认新密码</Label>
                  <Input
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirm_password: e.target.value,
                      })
                    }
                    className="h-10"
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordDialog(false)
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirm_password: "",
                    })
                  }}
                  className="h-10 px-4 hover:bg-gray-100"
                >
                  取消
                </Button>
                <Button 
                  type="submit"
                  className="h-10 px-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "更新中..." : "更新密码"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 