import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header'
import MyPage from './pages/MyPage/MyPage.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login';
import Signup from './pages/Signup';
// import LongTypingPractice from './pages/LongTypingPractice/LongTypingPractice.jsx'

function App() {
  return (
    <Router>
      {/* 공통 헤더 컴포넌트 각 페이지로 옮겨야할까? 이유: 로그인 후 돌아오는 홈 화면에 헤더가 빠져있음
      다시 해보니까 또 안그러네,,,? */}
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mypage" element={<MyPage />} /> 
        {/* <Route path="/long-typing-practice" element={<LongTypingPractice />} /> */}
      </Routes>
    </Router>
  );
}

export default App
