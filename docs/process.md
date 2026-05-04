
# 文字武侠游戏 - 全栈开发+本地自动化部署完整流程总结

## 📅 项目完成时间
2026年5月4日（最新更新时间）

---

## 🎯 项目目标
从前端开发，到后端开发，到本地自动化部署，跑通完整的全栈流程！

---

## 🏗️ 技术栈
### 前端
- Vue3 + TypeScript + Vite
- Pinia
### 后端
- Node.js + Express + TypeScript
- Mongoose + MongoDB
### 自动化部署
- GitHub Actions + self-hosted runner
### 服务管理
- PM2
### Web服务器
- Nginx

---

## 📁 最终项目文件结构
```
C:/Users/Administrator/Desktop/Code/
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions自动化部署脚本
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Player.ts  # 玩家数据模型
│   │   │   └── Monster.ts  # 怪物数据模型
│   │   ├── routes/
│   │   │   ├── player.ts  # 玩家接口（注册/登录/用户信息）
│   │   │   └── battle.ts  # 战斗系统接口
│   │   ├── middleware/
│   │   │   └── auth.ts  # 鉴权中间件/JWT校验/接口限流
│   │   └── index.ts  # 后端入口文件
│   ├── dist/  # 编译后的后端文件
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.ts
│   │   ├── api/
│   │   │   └── player.ts
│   │   └── utils/
│   │       └── request.ts
│   ├── dist/  # 编译后的前端文件
│   └── package.json
├── docs/
│   └── process.md  # 本文档
└── .gitignore
```

### 统一部署目录（D:/Development/okii-deploy/）
```
okii-deploy/
├── okii-front/
│   └── wuxia/
│       └── dist/
└── okii-back/
    └── wuxia/
        └── dist/
```

---

## 🚀 最终Nginx文件结构
```
D:/Development/nginx-1.25.3/
├── conf/
│   ├── nginx.conf  # 通用配置+主server块
│   └── mime.types
├── servers/
│   └── locations/
│       └── wuxia.conf  # wuxia项目单独配置
├── html/
├── logs/
└── nginx.exe
```

---

## 📝 各模块详细说明
### 1. GitHub Actions自动化部署
- **触发条件**：push到main分支
- **Runner**：本地self-hosted runner
- **流程**：
  1. pull最新代码
  2. 编译前端
  3. 编译后端
  4. 复制文件到统一部署目录
  5. 用PM2重启后端服务

### 2. Nginx配置
- **通用配置**：放在nginx.conf里
- **项目配置**：放在servers/locations/目录下，一个项目一个.conf文件
- **匹配优先级**：
  1. `=`精确匹配（最高）
  2. 普通字符串匹配，越长越优先

### 3. PM2管理
- **作用**：后台运行后端服务，自动重启，日志管理
- **常用命令**：
  ```bash
  pm2 start dist/index.js --name [项目名]
  pm2 restart [项目名]
  pm2 stop [项目名]
  pm2 delete [项目名]
  pm2 logs
  ```

---

## 🌐 新项目接入流程
1. 在`D:/Development/okii-deploy/okii-front/`下新建项目名目录
2. 在`D:/Development/okii-deploy/okii-back/`下新建项目名目录
3. 复制`servers/locations/wuxia.conf`，重命名为新项目名.conf
4. 修改新项目名.conf里的项目名和端口
5. 重启nginx

---

## ✨ 踩坑记录
1. **Nginx的alias不能放在if块里**
2. **Nginx的正则捕获变量可能被覆盖**
3. **Nginx的location块必须放在server块里**
4. **Nginx的include相对路径要注意工作目录，Windows下用绝对路径更稳妥**
5. **PM2的环境变量要加--update-env才能更新**

---

## 🎮 访问地址
本地访问：http://localhost/wuxia/

--- 

## 自动化部署

1. 开发完成后提交到github，自动触发deploy.yml流程，本地开启actions-runner监听（路径：D:\Development\actions-runner）
2. actions-runner会自动拉取最新代码，编译前端和后端，复制到统一部署目录（路径：D:\Development\okii-deploy），重启后端服务，重启nginx服务
3. nginx（路径：D:\Development\nginx-1.25.3）开启代理，浏览器访问http://localhost/wuxia-game/ 即可访问游戏
4. pm2启动后端服务（端口：8080）

## 💬 备注
后续可以：
1. 配置内网穿透，让外网访问
2. 开发更多游戏功能
3. 配置HTTPS
