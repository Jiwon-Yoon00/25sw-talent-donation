import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logoImage from '../assets/logo.png'; // 로고 이미지 경로 (확인 필요!)

const Login = () => {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('로그인 시도:', id, password);
    // 여기에 나중에 백엔드 로그인 API 연결
    navigate('/'); // 임시로 홈으로 이동
  };

  return (
    <div className="login-container">
      {/* 1. 뒤로가기 화살표 */}
      <button className="back-arrow" onClick={() => navigate('/')}>
        ←
      </button>

      {/* 2. 메인 박스 (좌우 분할) */}
      <div className="login-box">
        
        {/* 왼쪽: 로고/이미지 영역 */}
        <div className="login-left">
          <div className="logo-box">
            <img src={logoImage} alt="Typing Practice" className="login-logo-img" />
            <h2 className="logo-text">TYPING<br />PRACTICE</h2>
          </div>
        </div>

        {/* 오른쪽: 입력 폼 영역 */}
        <div className="login-right">
          <h1 className="login-title">Login</h1>
          
          <form onSubmit={handleLogin} className="login-form">
            <input 
              type="text" 
              placeholder="아이디" 
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="login-input"
            />
            <input 
              type="password" 
              placeholder="비밀번호" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            
            <button type="submit" className="login-btn">
              Login
            </button>
          </form>

          <p className="forgot-pw">Forget Password?</p>
        </div>
      </div>
    </div>
  );
};

export default Login;