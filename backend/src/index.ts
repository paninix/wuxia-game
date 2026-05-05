import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import playerRouter from './routes/player';
import userRouter from './routes/user';
import { sendError } from './utils/responseUtils';

// 1. 加载环境变量（指定路径，防止PM2启动时找不到.env）
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = Number(process.env.PORT) || 8080

// 2. 中间件配置
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析JSON格式的请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码格式的请求体

// 3. 连接MongoDB
const mongoURI = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/wuxia_game';
mongoose.connect(mongoURI!)
  .then(() => console.log('✅ MongoDB连接成功'))
  .catch(err => console.error('❌ MongoDB连接失败:', err));

// 4. 挂载路由
app.use('/api/player', playerRouter); // 保留原有player路由
app.use('/api/user', userRouter); // 新增user存档管理路由

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: '武侠游戏后端服务运行正常' });
});

// 5. 全局错误处理中间件（新手必学）
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ 全局错误:', err);
  sendError(res, '服务器内部错误，请稍后重试', 500);
});

// 6. 启动服务器
const server = app.listen(PORT, '0.0.0.0', () => {
  const address = server.address();
  if (typeof address === 'string') {
    console.log(`✅ 服务运行在 ${address}`);
  } else if (address) {
    console.log(`✅ 服务运行在 http://0.0.0.0:${address.port}`);
    console.log(`✅ 本地访问地址: http://localhost:${address.port}`);
  }
});

server.on('error', (err) => {
  console.error('❌ 服务启动失败:', err);
  process.exit(1);
});
