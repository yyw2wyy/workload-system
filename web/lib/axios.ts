import axios from "axios"

// 从 cookie 中获取 CSRF token
function getCookie(name: string) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 启用跨域请求时发送 cookies
})

// 添加请求拦截器
api.interceptors.request.use((config) => {
  // 获取 CSRF token
  const csrfToken = getCookie('csrftoken')
  
  // 如果存在 CSRF token，添加到请求头
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken
  }
  
  return config
}) 