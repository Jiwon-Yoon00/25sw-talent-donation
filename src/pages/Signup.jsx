import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // 스타일 파일 연결
import logoImage from '../assets/logo.png'; // 로고 이미지 경로 확인!

const Signup = () => {
  const navigate = useNavigate();
  
  // 입력값 상태 관리
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [school, setSchool] = useState('');

  const handleSignup = (e) => {
    e.preventDefault();
    
    // 간단한 유효성 검사
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다!');
      return;
    }

    console.log('회원가입 시도:', { id, password, school });
    alert('회원가입이 완료되었습니다!');
    navigate('/login'); // 가입 성공 시 로그인 페이지로 이동
  };

  return (
    <div className="signup-container">
      {/* 뒤로가기 버튼 */}
      <button className="back-arrow" onClick={() => navigate('/')}>
        ←
      </button>

      <div className="signup-box">
        {/* 왼쪽: 로고 영역 (로그인 페이지와 동일) */}
        <div className="signup-left">
          <div className="logo-box">
            <img src={logoImage} alt="Typing Practice" className="signup-logo-img" />
            <h2 className="logo-text">TYPING<br />PRACTICE</h2>
          </div>
        </div>

        {/* 오른쪽: 회원가입 폼 영역 */}
        <div className="signup-right">
          <h1 className="signup-title">Sign Up</h1>
          
          <form onSubmit={handleSignup} className="signup-form">
            <input 
              type="text" 
              placeholder="아이디" 
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="signup-input"
            />
            <input 
              type="password" 
              placeholder="비밀번호" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="signup-input"
            />
            <input 
              type="password" 
              placeholder="비밀번호 확인" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="signup-input"
            />
            <input 
              type="text" 
              placeholder="학교/소속" 
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="signup-input"
            />
            
            <button type="submit" className="signup-btn">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;