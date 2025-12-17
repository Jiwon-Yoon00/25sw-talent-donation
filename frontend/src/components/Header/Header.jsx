import React, { useState, useEffect, use } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Header.css';
import logoImage from '../../assets/logo.png';

const Header = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 로그인 상태 확인 API 호출
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8080/auth/status', {
          withCredentials: true,
        });
        if (response.status === 200 && response.data) {
          setIsLoggedIn(response.data.isLoggedIn);
        }
      } catch (error) {
        console.error("로그인 상태 확인 실패:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      // 로그아웃 요청
      await axios.get('http://localhost:8080/auth/logout', {
        withCredentials: true
      });

      // 프론트 상태 변경
      setIsLoggedIn(false);
      alert("로그아웃되었습니다.");
      navigate('/');
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <header className="mypage_header">
    <div className="header_logo">
      <Link to="/"><img src={logoImage} alt="연습 타자 로고" className="logo-img"/></Link>
    </div>

    <nav className="header_nav">
      {isLoggedIn ? (
        <>
          <Link to="mypage"><p>마이페이지</p></Link>
          <p onClick={handleLogout} style={{ cursor: 'pointer' }}>로그아웃</p>
        </>
      ) : (
        <>
          <Link to="/signup"><p>회원가입</p></Link>
          <Link to="/login"><p>로그인</p></Link>
        </>
      )}
    </nav>
  </header>
  );
};

export default Header;
