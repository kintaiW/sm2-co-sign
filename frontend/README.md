# SM2 协同签名服务管理后台

SM2 协同数字签名服务管理后台，提供密钥管理、签名服务、用户管理、系统监控等功能的 Web 前端界面。

## 技术栈

- **框架**: React 18 + TypeScript
- **UI 库**: Ant Design 5.x
- **状态管理**: Zustand
- **路由**: React Router 6
- **HTTP 客户端**: Axios
- **图表**: ECharts
- **构建工具**: Vite 5.x
- **样式**: CSS Modules + Less

## 环境要求

| 依赖 | 版本要求 |
|------|----------|
| Node.js | >= 20.19.0 或 >= 22.12.0 |
| npm | >= 10.0.0 |
| 操作系统 | Windows / macOS / Linux |

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动后访问 http://localhost:3000

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
frontend/
├── public/                     # 静态资源
│   └── favicon.svg
├── src/
│   ├── api/                    # API 接口封装
│   │   ├── index.ts            # Axios 实例配置
│   │   ├── auth.ts             # 认证接口
│   │   ├── user.ts             # 用户管理接口
│   │   ├── key.ts              # 密钥管理接口
│   │   ├── sign.ts             # 签名服务接口
│   │   ├── log.ts              # 日志接口
│   │   └── monitor.ts          # 监控接口
│   ├── components/             # 通用组件
│   ├── layouts/                # 布局组件
│   │   └── AdminLayout/        # 管理后台布局
│   ├── pages/                  # 页面组件
│   │   ├── login/              # 登录页
│   │   ├── dashboard/          # 仪表盘
│   │   ├── keys/               # 密钥管理
│   │   ├── sign/               # 签名服务
│   │   ├── users/              # 用户管理
│   │   └── logs/               # 操作日志
│   ├── router/                 # 路由配置
│   ├── stores/                 # Zustand 状态管理
│   ├── types/                  # TypeScript 类型定义
│   ├── utils/                  # 工具函数
│   ├── styles/                 # 全局样式
│   ├── App.tsx
│   └── main.tsx
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 功能模块

### 1. 登录页
- 用户名密码登录
- 登录状态持久化
- 自动跳转

### 2. 仪表盘
- 系统统计卡片（密钥总数、今日签名、活跃用户、服务状态）
- 签名趋势图表
- 密钥状态饼图
- 最近操作记录

### 3. 密钥管理
- 密钥列表展示
- 搜索过滤
- 详情查看
- 删除操作

### 4. 签名服务
- 签名请求表单
- 签名结果展示
- 一键复制

### 5. 用户管理
- 用户列表展示
- 状态切换（启用/禁用）
- 详情查看
- 删除操作

### 6. 操作日志
- 日志查询
- 操作类型筛选
- CSV 导出

## API 对接

前端通过 Axios 与后端 API 交互，API 基础路径配置：

- 开发环境: `http://localhost:9002`
- 生产环境: `/`（相对路径）

### 主要接口

| 类别 | 接口 | 说明 |
|------|------|------|
| 认证 | POST /api/login | 登录获取 Token |
| 认证 | POST /api/logout | 登出 |
| 用户 | GET /api/user/info | 当前用户信息 |
| 用户管理 | GET /mapi/users | 用户列表 |
| 用户管理 | DELETE /mapi/users/:id | 删除用户 |
| 用户管理 | PUT /mapi/users/:id/status | 更新状态 |
| 密钥管理 | GET /mapi/keys | 密钥列表 |
| 密钥管理 | DELETE /mapi/keys/:id | 删除密钥 |
| 签名服务 | POST /api/sign | 执行签名 |
| 日志 | GET /mapi/logs | 审计日志 |
| 监控 | GET /mapi/stats | 系统统计 |
| 监控 | GET /mapi/health | 健康检查 |

## 默认管理员账户

| 字段 | 值 |
|------|-----|
| 用户名 | adminSystem |
| 密码 | admin123 |

> ⚠️ **安全提示**: 生产环境请务必修改默认密码！

## 部署指南

### 1. 构建

```bash
# 安装依赖
npm install

# 生产构建
npm run build
```

### 2. 静态文件部署

构建产物位于 `dist/` 目录，可部署到任意静态文件服务器。

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/frontend/dist;
    index index.html;
    
    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api {
        proxy_pass http://backend:9002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /mapi {
        proxy_pass http://backend:9002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Docker 部署

#### Dockerfile

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 构建和运行

```bash
# 构建镜像
docker build -t sm2-admin-frontend .

# 运行容器
docker run -d -p 80:80 sm2-admin-frontend
```

### 4. Docker Compose 部署

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - sm2-network
  
  backend:
    build: ./backend
    ports:
      - "9002:9002"
    volumes:
      - ./backend/data:/app/data
    networks:
      - sm2-network

networks:
  sm2-network:
    driver: bridge
```

### 5. 环境变量配置

创建 `.env.production` 文件：

```env
VITE_API_BASE_URL=/
```

### 6. 安全建议

1. **HTTPS**: 生产环境必须启用 HTTPS
2. **密码策略**: 修改默认管理员密码
3. **CORS**: 配置正确的 CORS 策略
4. **CSP**: 配置内容安全策略
5. **日志**: 启用访问日志记录

## 开发指南

### 代码规范

- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 样式使用 CSS Modules
- 遵循 ESLint 规则

### 添加新页面

1. 在 `src/pages/` 创建页面目录
2. 在 `src/router/index.tsx` 添加路由
3. 在 `src/layouts/AdminLayout/index.tsx` 添加菜单项

### 添加新 API

1. 在 `src/types/index.ts` 定义类型
2. 在 `src/api/` 创建或修改 API 文件
3. 在组件中调用

## 技术支持

本项目由 [kintaiW (黄鑫泰)](https://github.com/kintaiW) 提供技术支持。

专注国密算法、隐私计算、数据安全合规领域。

## 许可证

MIT License
