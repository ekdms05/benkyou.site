const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT 비밀키 (실제 프로덕션에서는 환경 변수로 관리해야 함)
const JWT_SECRET = 'your-secret-key';

exports.protect = async (req, res, next) => {
  try {
    // 토큰 확인
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }
    
    // 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 사용자 확인
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
    
    // 요청 객체에 사용자 정보 추가
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '인증 실패', error: error.message });
  }
};

// 특정 역할만 접근 가능하도록 제한
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '이 작업을 수행할 권한이 없습니다.' });
    }
    next();
  };
};