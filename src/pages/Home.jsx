import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RankingBoard from '../components/RankingBoard/RankingBoard';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  // 데이터 (나중에 API로 대체)
  /*
  const userRankData = [
    { name: 'id_34', score: '700타' },
    { name: 'id_20', score: '626타' },
    { name: 'id_78', score: '611타' },
    { name: 'id_02', score: '514타' },
    { name: 'id_22', score: '222타' },
  ];

  const schoolRankData = [
    { name: '항공대' },
    { name: '연세대' },
    { name: '고려대' },
    { name: '덕은초' },
    { name: '서울대' },
  ];
  */

  const [userRankData, setUserRankData] = useState([]);
  const [schoolRankData, setSchoolRankData] = useState([]);

  useEffect(() => {
    // 유저 랭킹 데이터 가져오기
    const fetchRankData = async () => {
      try {
        const userRes = await axios.get('http://localhost:8080/rank/users');
        const schoolRes = await axios.get('http://localhost:8080/rank/schools');

        setUserRankData(userRes.data);
        setSchoolRankData(schoolRes.data);
      } catch (error) {
        console.error("랭킹 데이터 가져오기 실패:", error);
      }
    };

    fetchRankData();
  }, []);

  return (
    <div className="container">      
      <main className="main-content">
        {/* 2. 랭킹 보드 컴포넌트 사용 */}
        <section className="ranking-section">
          <RankingBoard 
            title="유저 랭킹" 
            color="red" 
            icon="🏆" 
            data={userRankData} 
          />
          <RankingBoard 
            title="학교 랭킹" 
            color="blue" 
            icon="🔥" 
            data={schoolRankData} 
          />
        </section>

        {/* 3. 시작 버튼 영역*/}
        <section className="start-section">
          <h2 className="start-title">지금 바로 시작하기</h2>
          <div className="button-group">
            <button 
              className="action-btn"
              onClick={() => navigate('/word-typing-practice')}
            >
              낱말 연습
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/long-typing-practice')}
            >
              긴글 연습
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/ranking')}
            >
              랭킹
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;