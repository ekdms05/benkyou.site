const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우트
app.use('/api/auth', authRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('학원 관리 시스템 API 서버');
});

// 데이터베이스 연결
mongoose.connect('mongodb://localhost:27017/academyDB')
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.error('MongoDB 연결 오류:', err));

// 소켓 연결 처리
io.on('connection', (socket) => {
  console.log('사용자 연결됨:', socket.id);
  
  socket.on('studyStatus', (data) => {
    console.log('학습 상태 업데이트:', data);
    // 다른 클라이언트에게 전파
    io.emit('studyStatusUpdate', data);
  });
  
  socket.on('disconnect', () => {
    console.log('사용자 연결 해제:', socket.id);
  });
});

// 서버 시작
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
});