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

// 角色映射表
const roleMap: Record<string, string> = {
  teacher: '教师',
  admin: '管理员',
  student: '学生',
}

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
      setFormData({
        username: user?.username || "",
        email: user?.email || "",
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || "更新失败，请重试", {
        position: "top-center",
        duration: 3000,
      })
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
      }

      // 处理每个字段的所有错误信息
      Object.entries(errorData).forEach(([field, errors]) => {
        if (Array.isArray(errors)) {
          errors.forEach((error: string) => {
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
            toast.error(`${fieldName}：${translatedError}`, {
              duration: 5000,
              position: "top-center",
            })
          })
        }
      })

      // 如果没有具体的错误信息，显示通用错误
      if (Object.keys(errorData).length === 0) {
        toast.error("密码修改失败，请重试", {
          duration: 3000,
          position: "top-center",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">个人中心</h1>

      <Card>
        <CardHeader>
          <CardTitle>个人信息</CardTitle>
          <CardDescription>查看和管理您的个人信息</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">用户名</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {user.username || '未设置'}
              </dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">邮箱</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {user.email || '未设置'}
              </dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">角色</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {getRoleDisplay(user.role)}
              </dd>
            </div>
          </dl>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => setShowEditDialog(true)}
              variant="outline"
            >
              更改资料
            </Button>
            <Button
              onClick={() => setShowPasswordDialog(true)}
            >
              修改密码
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 编辑资料对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更改资料</DialogTitle>
            <DialogDescription>
              修改您的用户名和邮箱地址
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
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
              >
                取消
              </Button>
              <Button type="submit">
                保存
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
            <DialogDescription>
              更新您的账户密码
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">当前密码</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                required
                minLength={8}
              />
              <p className="text-sm text-gray-500">
                密码必须至少8个字符，不能全为数字，且不能使用常见密码
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">确认新密码</Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirm_password: e.target.value,
                  })
                }
                required
                minLength={8}
              />
            </div>
            <div className="flex justify-end space-x-2">
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
              >
                取消
              </Button>
              <Button type="submit">
                更新密码
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 