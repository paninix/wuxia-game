import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import playerRouter from './routes/player';
import battleRouter from './routes/battle';
import Monster from './models/Monster';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json());

// 连接MongoDB
const mongoURI = process.env.MONGO_URL || process.env.MONGODB_URI;
mongoose.connect(mongoURI!)
  .then(async () => {
    console.log('MongoDB连接成功');
    // 初始化默认怪物数据
    await Monster.initDefaultMonsters();
  })
  .catch(err => console.error('MongoDB连接失败:', err));

app.use('/api/player', playerRouter);
app.use('/api/battle', battleRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: '武侠游戏后端服务运行正常' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  const address = server.address();
  if (typeof address === 'string') {
    console.log(`服务运行在 ${address}`);
  } else if (address) {
    console.log(`服务运行在 http://0.0.0.0:${address.port}`);
    console.log(`本地访问地址: http://localhost:${address.port}`);
  }
});

server.on('error', (err) => {
  console.error('服务启动失败:', err);
  process.exit(1);
});
