import React from 'react';
import './RankingBoard.css';

const RankingBoard = ({ title, color, icon, data }) => {
  return (
    <div className={`ranking-board ${color}`}>
      <h3 className="ranking-title">
        {title} {icon}
      </h3>
      {data.map((item, index) => (
        <div key={index} className={`ranking-item ${color}`}>
          <div className="avatar" />
          <div className="user-info">
            <div className="user-name">{item.user_id}</div>
            <div className="user-score">{item.maxAvgWpm}타</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RankingBoard;