import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import logoImage from '../assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('로그인 시도:', id, password);

    if (!id || !password) {
      return alert("아이디와 비밀번호를 모두 입력해주세요.");
    }

    try {
      const response = await axios.post('http://localhost:8080/auth/login',
        {
          username: id,
          password: password,
        },
        {
          withCredentials: true, // 쿠키(세션)
        }
      );

      // 로그인 성공 시 (200 OK)
      if (response.status === 200) {
        console.log("로그인 성공!");
        alert("환영합니다! 타자 연습을 시작하세요.");
        //navigate('/');
        window.location.href = '/';
      }

    } catch (error) {
      // 에러 처리
      console.error("로그인 에러:", error);
      
      if (error.response && error.response.status === 401) {
        alert("아이디 또는 비밀번호가 틀렸습니다.");
      } else {
        alert("로그인 중 문제가 발생했습니다. 서버를 확인해주세요.");
      }
    }
  };

  return (
    <div className="login-container">
      <button className="back-arrow" onClick={() => navigate('/')}>
        ←
      </button>

      <div className="login-box">
        
        <div className="login-left">
          <div className="logo-box">
            <img src={logoImage} alt="Typing Practice" className="login-logo-img" />
            <h2 className="logo-text">TYPING<br />PRACTICE</h2>
          </div>
        </div>

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