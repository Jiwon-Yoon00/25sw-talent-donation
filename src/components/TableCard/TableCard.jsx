import './TableCard.css';

const TableCard = ({ type, date, avgWpm, maxWpm, accuracy }) => {

  const displayType =
    type === "long"
      ? "긴글 연습"
      : type === "word"
      ? "낱말 연습"
      : type || "";

  // date를 YYYY-MM-DD HH:MM 형식으로 변환
  const formattedDate = new Date(date).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="table-card">
      <div className="table-card-info">
        <p className="table-card-type">{displayType}</p>
        <p className="table-card-date">{formattedDate}</p>
      </div>
      <div className="table-card-stats">
        <div className="stat-item">
          <p className="stat-label">평균 타수</p>
          <p className="stat-value">{avgWpm}</p>
        </div>
        <div className="stat-item">
          <p className="stat-label">최고 타수</p>
          <p className="stat-value">{maxWpm}</p>
        </div>
        <div className="stat-item">
          <p className="stat-label">정확도</p>
          <p className="stat-value">{accuracy}%</p>
        </div>
      </div>
    </div>
  );
};

export default TableCard;
