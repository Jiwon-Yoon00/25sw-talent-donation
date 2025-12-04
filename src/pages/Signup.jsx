import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';
import logoImage from '../assets/logo.png';

const Signup = () => {
  const navigate = useNavigate();
  
  // 입력값 상태 관리
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [school, setSchool] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // 간단한 유효성 검사
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다!');
      return;
    }

    if (!id || !password || !school) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    /*
    try {
      // 서버로 회원가입 요청 보내기
      const response = await axios.post(
        'http://localhost:8080/auth/signup', // 백엔드 팀원과 주소 맞추기!
        {
          // Passport는 보통 'username'이라는 필드명을 기본으로 사용합니다.
          // 우리 화면엔 '아이디'라고 되어 있지만, 서버엔 'username'으로 보내줌
          username: id,     
          password: password,
          school: school,
        },
        {
          withCredentials: true, // 혹시 모를 쿠키 설정을 위해 켜두는 게 좋습니다.
        }
      );

      // 성공 처리 (201 Created 또는 200 OK)
      if (response.status === 201 || response.status === 200) {
        alert("회원가입이 완료되었습니다! 로그인 해주세요.");
        navigate('/login');
      }

    } catch (error) {
      // 에러 처리 (이미 있는 아이디 등)
      console.error("회원가입 실패:", error);

      // 백엔드에서 409 Conflict (중복된 아이디) 에러를 보내준다면
      if (error.response && error.response.status === 409) {
        alert("이미 사용 중인 아이디입니다. 다른 아이디를 써주세요.");
      } else {
        alert("회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
    */

    // 임시로 로그인 페이지 이동
    console.log('회원가입 시도:', { id, password, school });
    alert('회원가입이 완료되었습니다!');
    navigate('/login');
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