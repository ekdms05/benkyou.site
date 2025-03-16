const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT 비밀키 (실제 프로덕션에서는 환경 변수로 관리해야 함)
const JWT_SECRET = 'your-secret-key';

// 회원가입
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // 이미 존재하는 사용자인지 확인
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 사용자입니다.' });
    }
    
    // 새 사용자 생성
    const user = new User({
      username,
      email,
      password,
      role,
    });
    
    await user.save();
    
    // 비밀번호 제외하고 응답
    user.password = undefined;
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    // 비밀번호 확인
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // 사용자 정보와 토큰 반환
    user.password = undefined;
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
};

// 현재 사용자 정보 가져오기
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
};