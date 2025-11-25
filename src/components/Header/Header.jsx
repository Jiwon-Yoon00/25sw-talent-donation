// Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="mypage_header">
    <div className="header_logo">연습 타자</div>
    <nav className="header_nav">
      <Link to="/mypage"><p>마이페이지</p></Link>
      <Link to="/signup"><p>회원가입</p></Link>
      <Link to="/login"><p>로그인</p></Link>
    </nav>
  </header>
  );
};

export default Header;
