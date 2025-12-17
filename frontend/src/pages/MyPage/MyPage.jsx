import { useState, useEffect } from "react";
import axios from "axios";
import TypingSummaryCard from "@/components/TypingSummaryCard/TypingSummaryCard";
import TableCard from "@/components/TableCard/TableCard";
import GraphCard from "@/components/GraphCard/GraphCard";
import SideBar from "@/components/SideBar/SideBar";
import MyPageMenu from "@/components/MyPageMenu/MyPageMenu.jsx";
import "./MyPage.css";

const MyPage = () => {

  const [userId, setUserId] = useState("");
  const [summary, setSummary] = useState({
    avgWpm: 0,
    bestMaxWpm: 0,
    avgAccuracy: 0,
    practiceTime: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);
  const [practiceRecords, setPracticeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setSummaryLoading(true);
        setSummaryError(null);

        const res = await axios.get("http://localhost:8080/api/summaryCard/long", {
          withCredentials: true,
        });

        setSummary({
          avgWpm: Number(res.data?.avgWpm ?? 0),
          bestMaxWpm: Number(res.data?.bestMaxWpm ?? 0),
          avgAccuracy: Number(res.data?.avgAccuracy ?? 0),
          practiceTime: Number(res.data?.practiceTime ?? 0),
        });
      } catch (err) {
        console.error("요약 카드 조회 실패:", err);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, []);

  useEffect(() => {
    const fetchPracticeRecords = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          "http://localhost:8080/api/practiceRecord/long",
          {
            withCredentials: true, 
          }
        );

        const raw = res.data;
        const list = Array.isArray(raw) ? raw : raw ? [raw] : [];

        if (list.length > 0 && list[0].user_id) {
          setUserId(list[0].user_id);
        }

        const mapped = list.map((item, idx) => ({
          id: item.user_id ?? item.id ?? idx,
          date: item.createdAt, 
          type: item.type ?? "긴글연습",
          accuracy: item.accuracy,
          maxWpm: item.max_wpm,
          avgWpm: item.avg_wpm,
          durationMin:
            typeof item.elapsedTime === "number"
              ? Math.round(item.elapsedTime / 60)
              : undefined,
        }));

        setPracticeRecords(mapped);
      } catch (err) {
        console.error("마이페이지 연습 기록 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPracticeRecords();
  }, []);

  const lastestFive = [...practiceRecords]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const handleGraphSelectChange = (e) => {
    setDays(Number(e.target.value)); 
  };

  return (
    <div>
      <div className="mypage_container">
        <SideBar title="마이페이지" menu={<MyPageMenu />} userId={userId} />
        <div className="main_mypage">
          <div className="summary_box">
            <p className="summary_cards_title">나의 타자 현황</p>

            {summaryLoading && <p>요약 정보를 불러오는 중입니다...</p>}
            {!summaryLoading && summaryError && (
              <p className="error_text">{summaryError}</p>
            )}
            {!summaryLoading && (
              <div className="summary_cards">
                <TypingSummaryCard
                  title="평균 타자"
                  stats={`${summary.avgWpm.toFixed(0)} 타`}
                />
                <TypingSummaryCard
                  title="최고 타자"
                  stats={`${summary.bestMaxWpm.toFixed(0)} 타`}
                />
                <TypingSummaryCard
                  title="정확도"
                  stats={`${summary.avgAccuracy.toFixed(1)}%`}
                />
                <TypingSummaryCard
                  title="연습 시간"
                  stats={`${Math.floor(summary.practiceTime / 60)}분`}
                />
              </div>
            )}
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

              {loading && <p>연습 기록을 불러오는 중입니다...</p>}
              {!loading && error && <p className="error_text">{error}</p>}
              {!loading && !error && (
                <GraphCard datas={practiceRecords} days={Number(days)} />
              )}
            </div>
            <div className="background_cards">
              <p className="cards_title">나의 연습 기록</p>
              <div className="cards_list">
                {lastestFive.map((card) => (
                  <TableCard
                    key={card.date} 
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
