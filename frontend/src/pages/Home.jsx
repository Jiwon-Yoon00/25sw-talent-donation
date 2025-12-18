import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RankingBoard from '../components/RankingBoard/RankingBoard';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const [userRankData, setUserRankData] = useState([]);
  const [schoolRankData, setSchoolRankData] = useState([]);

  useEffect(() => {
    // 랭킹 데이터 가져오기
    const fetchRankData = async () => {
      try {
        const userRes = await axios.get('http://localhost:8080/api/rank',
          {
            withCredentials:true,
          }
        );
        // const schoolRes = await axios.get('http://localhost:8080/rank/schools');

        setUserRankData(userRes.data);
        // setSchoolRankData(schoolRes.data);
      } catch (error) {
        console.error("랭킹 데이터 가져오기 실패:", error);
      }
    };

    fetchRankData();
  }, []);

  return (
    <div className="container">      
      <main className="main-content">
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