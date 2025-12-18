import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';
import logoImage from '../assets/logo.png';

const Signup = () => {
  const navigate = useNavigate();
  
  // 입력값 관리
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [school, setSchool] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    
    try {
      // 회원가입 요청
      const response = await axios.post(
        'http://localhost:8080/auth/signup',
        {
          username: id,     
          password: password,
          school: school,
        },
        {
          withCredentials: true,
        }
      );

      // 성공 처리
      if (response.status === 201 || response.status === 200) {
        alert("회원가입이 완료되었습니다! 로그인 해주세요.");
        navigate('/login');
      }

    } catch (error) {
      // 에러 처리
      console.error("회원가입 실패:", error);

      // 409 Conflict
      if (error.response && error.response.status === 409) {
        alert("이미 사용 중인 아이디입니다. 다른 아이디를 써주세요.");
      } else {
        alert("회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="signup-container">
      <button className="back-arrow" onClick={() => navigate('/')}>
        ←
      </button>

      <div className="signup-box">
        <div className="signup-left">
          <div className="logo-box">
            <img src={logoImage} alt="Typing Practice" className="signup-logo-img" />
            <h2 className="logo-text">TYPING<br />PRACTICE</h2>
          </div>
        </div>

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