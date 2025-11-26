import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header'
import MyPage from './pages/MyPage/MyPage.jsx'
// import LongTypingPractice from './pages/LongTypingPractice/LongTypingPractice.jsx'

function App() {
  return (
    <Router>
      <Header /> 
      <Routes>
        {/* <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />*/}
        <Route path="/mypage" element={<MyPage />} /> 
        {/* <Route path="/long-typing-practice" element={<LongTypingPractice />} /> */}
      </Routes>
    </Router>
  );
}

export default App
