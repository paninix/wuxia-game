import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import playerRouter from './routes/player';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 连接MongoDB
const mongoURI = process.env.MONGO_URL || process.env.MONGODB_URI;
mongoose.connect(mongoURI!)
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => console.error('MongoDB连接失败:', err));

app.use('/api/player', playerRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: '武侠游戏后端服务运行正常' });
});

app.listen(PORT, () => {
  console.log(`服务运行在 http://localhost:${PORT}`);
});
