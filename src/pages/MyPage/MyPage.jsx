// 마이페이지 입니다
import { useState } from "react";
import TypingSummaryCard from "../../components/TypingSummaryCard/TypingSummaryCard";
import TableCard from "../../components/TableCard/TableCard";
import GraphCard from "../../components/GraphCard/GraphCard";
import SideBar from "../../components/SideBar/SideBar";
import MyPageMenu from "../../components/MyPageMenu/MyPageMenu.jsx";
import "./MyPage.css";

const MyPage = () => {
  const summaryCards = [
    { title: "평균 타자", stats: "120", type: "긴글 연습" },
    { title: "최고 타자", stats: "140", type: "긴글 연습" },
    { title: "정확도", stats: "100%", type: "긴글 연습" },
    { title: "연습 시간", stats: "12시간", type: "긴글 연습" },
  ];

  const mockSessions = [
    {
      id: "s1",
      date: "2025-11-24T09:12:00.000Z",
      type: "긴글연습",
      accuracy: 97.3,
      maxWpm: 432,
      avgWpm: 312,
      durationMin: 30,
    },
    {
      id: "s2",
      date: "2025-11-23T20:05:00.000Z",
      type: "긴글연습",
      accuracy: 95.8,
      maxWpm: 401,
      avgWpm: 298,
      durationMin: 25,
    },
    {
      id: "s3",
      date: "2025-11-22T18:40:00.000Z",
      type: "긴글연습",
      accuracy: 92.1,
      maxWpm: 365,
      avgWpm: 280,
      durationMin: 20,
    },
    {
      id: "s4",
      date: "2025-11-21T07:30:00.000Z",
      type: "긴글연습",
      accuracy: 99.0,
      maxWpm: 350,
      avgWpm: 330,
      durationMin: 45,
    },
    {
      id: "s5",
      date: "2025-11-20T22:10:00.000Z",
      type: "긴글연습",
      accuracy: 88.5,
      maxWpm: 320,
      avgWpm: 240,
      durationMin: 15,
    },
    {
      id: "s6",
      date: "2025-11-19T14:50:00.000Z",
      type: "긴글연습",
      accuracy: 94.6,
      maxWpm: 378,
      avgWpm: 290,
      durationMin: 28,
    },
    {
      id: "s7",
      date: "2025-11-18T11:00:00.000Z",
      type: "긴글연습",
      accuracy: 90.2,
      maxWpm: 345,
      avgWpm: 265,
      durationMin: 22,
    },
    {
      id: "s8",
      date: "2025-11-17T19:45:00.000Z",
      type: "긴글연습",
      accuracy: 96.7,
      maxWpm: 305,
      avgWpm: 305,
      durationMin: 32,
    },
    {
      id: "s9",
      date: "2025-11-16T08:20:00.000Z",
      type: "긴글연습",
      accuracy: 89.9,
      maxWpm: 330,
      avgWpm: 250,
      durationMin: 18,
    },
    {
      id: "s10",
      date: "2025-11-15T21:15:00.000Z",
      type: "긴글연습",
      accuracy: 93.4,
      maxWpm: 360,
      avgWpm: 275,
      durationMin: 26,
    },
    {
      id: "s11",
      date: "2025-11-14T16:00:00.000Z",
      type: "긴글연습",
      accuracy: 98.1,
      maxWpm: 440,
      avgWpm: 322,
      durationMin: 40,
    },
    {
      id: "s12",
      date: "2025-11-13T10:30:00.000Z",
      type: "긴글연습",
      accuracy: 86.7,
      maxWpm: 300,
      avgWpm: 230,
      durationMin: 12,
    },
  ];

  const lastestFive = [...mockSessions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const [days, setDays] = useState(7);
  const handleGraphSelectChange = (e) => {
    setDays(Number(e.target.value)); 
  };

  return (
    <div>
      <div className="mypage_container">
        <SideBar title="마이페이지" menu={<MyPageMenu />} />
        <div className="main_mypage">
          <div className="summary_box">
            <p className="summary_cards_title">나의 타자 현황</p>

            <div className="summary_cards">
              {summaryCards.map((card) => (
                <TypingSummaryCard title={card.title} stats={card.stats} />
              ))}
            </div>
          </div>
          <div className="summary_and_table">
            <div className="background_cards">
              <div className="graph_header">
                <p className="cards_title">분석 그래프</p>

                <select className="graph_select" onChange={handleGraphSelectChange}>
                  <option value="7">7일</option>
                  <option value="30">30일</option>
                </select>
              </div>
              <GraphCard datas={mockSessions} days={Number(days)} />
            </div>
            <div className="background_cards">
              <p className="cards_title">나의 연습 기록</p>
              <div className="cards_list">
                {lastestFive.map((card) => (
                  <TableCard
                    key={card.date} // map 안에서는 key 필요
                    type={card.type}
                    date={card.date}
                    accuracy={card.accuracy}
                    maxWpm={card.maxWpm}
                    avgWpm={card.avgWpm}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
