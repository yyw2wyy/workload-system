### 问题描述

用户可以正常注册、登录，但是登录过后点击其他页面提示403。

### 范围：

大部分用户：hkd、sw、zgy、ly。

未出现：我的所有设备、ytt的工位电脑、406会议室笔记本

### 报错信息

#### 控制台

![image-2025-7-22_17-22-8](img/image-2025-7-22_17-22-8.png)

#### 返回包

![image-2025-7-22_17-21-1](img/image-2025-7-22_17-21-1.png)

#### 请求标头

![image-2025-7-22_17-20-51](img/image-2025-7-22_17-20-51.png)

#### 正常的请求标头

![正常](img/正常.png)

#### 问题：

可以看到没有Cookie。

### 参考资料

[dajngo设置cookie的samesite属性_django 设置samesite-CSDN博客](https://blog.csdn.net/qq_31910669/article/details/116497899)

### GPT建议

#### 方法一：**确保所有请求为“同源请求”**

Django 后端在 localhost:8000，前端在 localhost:3000，**严格来说是“跨源”**（不同端口号被视为不同 origin）。

🔧 **你可以这样做**（推荐）：

1. **让 React 请求使用相对路径，而不是 baseURL 设置为 `http://localhost:8000/api`**：

```
ts


复制编辑
const baseURL = '/api'; // 而不是 'http://localhost:8000/api'
```

1. 所有同学建立双隧道：

```
bash


复制编辑
ssh -L 3000:localhost:3000 -L 8000:localhost:8000 user@server_ip
```

这样：

- React 前端在 `http://localhost:3000`
- 请求 `/api/...` → 自动发到 `localhost:8000`（本地通过隧道）

这种情况下，前后端都在 `localhost`，**不会触发跨域机制**，cookie 能顺利传递，Django 能收到 `sessionid` 和 `csrftoken`。

#### 方法二：使用 JWT 替代 Session + CSRF（面向未来）

如果系统后续计划长期使用、部署在公网，建议切换成 **JWT 认证** 模式：

- 不依赖 Cookie，所有请求使用 `Authorization: Bearer <token>`；
- 前端保存 token（如 localStorage）；
- 后端不需要 CSRF 验证；
- 跨域也不容易出问题。

这会从根本上消除 Cookie 传输的所有困扰，但需要你重构认证系统（可以后考虑）。

### 最终做法

![wechat_2025-08-03_161035_398](img/wechat_2025-08-03_161035_398.png)

### 其他

和gpt的对话太长了，得总结后重开一个窗口
