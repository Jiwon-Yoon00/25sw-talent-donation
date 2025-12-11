// Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import logoImage from '../../assets/logo.png';

const Header = () => {
  return (
    <header className="mypage_header">
    <div className="header_logo">
      <Link to="/"><img src={logoImage} alt="연습 타자 로고" className="logo-img"/></Link>
    </div>
    <nav className="header_nav">
      <Link to="/mypage"><p>마이페이지</p></Link>
      <Link to="/signup"><p>회원가입</p></Link>
      <Link to="/login"><p>로그인</p></Link>
    </nav>
  </header>
  );
};

export default Header;
