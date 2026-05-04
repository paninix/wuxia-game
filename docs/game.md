# 网页文字武侠游戏 - 开发文档

## 🎮 游戏整体结构
```
├── backend/        # 后端服务（Node.js + Express + TypeScript + MongoDB）
│   ├── src/
│   │   ├── models/       # 数据模型层
│   │   ├── routes/       # 接口路由层
│   │   ├── middleware/   # 中间件层
│   │   └── index.ts      # 服务入口
│   └── package.json
├── frontend/       # 前端应用（Vue3 + TypeScript）
└── docs/           # 项目文档
```

## ✅ 已实现功能
### 1. 用户认证系统
- **功能点**：用户注册、用户登录、JWT鉴权、token自动续期、接口限流、统一错误处理
- **安全特性**：
  - 密码使用bcrypt加盐哈希加密，10轮加密强度
  - JWT token有效期7天，支持过期校验和无效token拦截
  - 登录接口15分钟内最多5次尝试，防止暴力破解
  - 注册接口1小时内最多3次尝试，防止恶意注册
  - 所有请求参数自动校验，返回统一格式错误信息

### 2. PVE回合制战斗系统
- **怪物系统**：内置4种默认怪物（史莱姆/野猪/小毛贼/青蛇），分区域配置，支持自定义怪物属性、掉落、刷新区域
- **战斗机制**：
  - 经典回合制战斗，玩家先手攻击
  - 10%概率触发暴击，造成1.5倍伤害
  - 15%概率触发闪避，完全免疫本次伤害
  - 数值动态平衡：等级差超过3级经验减半，越2级打怪经验加成50%
- **奖励机制**：击败怪物获得经验、金币、概率掉落物品
- **成长系统**：升级自动提升属性（生命上限+20、魔力上限+10、攻击+3、防御+2），升级自动满血满蓝
- **惩罚机制**：战斗失败损失10%金币，自动回城恢复满状态
- **恢复功能**：消耗10金币恢复满生命值和魔力值

## 📚 后端API接口文档
### 公共接口
- `GET /api/health` 服务健康检查
- `POST /api/player/register` 用户注册
  ```json
  请求：{ "username": "账号", "password": "密码", "name": "角色名" }
  返回：{ "code": 201, "message": "注册成功", "data": { "user": "用户信息", "token": "鉴权token" } }
  ```
- `POST /api/player/login` 用户登录
  ```json
  请求：{ "username": "账号", "password": "密码" }
  返回：{ "code": 200, "message": "登录成功", "data": { "user": "用户信息", "token": "鉴权token" } }
  ```

### 需要鉴权的接口（请求头需携带 Authorization: Bearer <token>）
- `GET /api/player/profile` 获取当前登录用户信息
- `PUT /api/player/profile` 更新当前用户信息
- `GET /api/battle/monsters` 获取当前区域可挑战的怪物列表
- `POST /api/battle/start` 发起战斗
  ```json
  请求：{ "monsterId": "怪物ID" }
  返回：战斗日志、奖励/惩罚信息、玩家最新属性
  ```
- `POST /api/battle/recover` 消耗金币恢复满生命值和魔力值

## 🚀 计划新增的功能（按优先级排序）
1. **背包/装备系统**：物品查看、使用、装备穿戴/卸下、属性加成、物品堆叠拆分
2. **商店/交易系统**：商店商品浏览、购买/出售物品、背包物品管理
3. **任务系统**：主线任务/支线任务领取、进度追踪、奖励自动发放
4. **地图探索系统**：多区域地图、区域解锁、移动冷却、随机事件触发
5. **PVP竞技场系统**：玩家匹配、实时对战、排行榜、段位系统
6. **公会/社交系统**：公会创建/加入、公会任务、好友系统、聊天功能
7. **数据统计系统**：玩家行为统计、游戏数据大盘、运营后台
8. **多端适配**：小程序端、H5端、桌面端适配

## ⚙️ 技术栈说明
### 后端技术栈
- Node.js + Express 4.x 服务框架
- TypeScript 静态类型检查
- MongoDB + Mongoose 7.x 数据库ORM
- bcrypt 密码加密
- jsonwebtoken JWT鉴权
- express-validator 请求参数校验
- express-rate-limit 接口限流
- PM2 生产环境进程管理

### 前端技术栈
- Vue 3.x 响应式框架
- TypeScript 类型安全
- Pinia 状态管理
- Vue Router 路由管理
- Element Plus UI组件库
- Axios HTTP请求库
