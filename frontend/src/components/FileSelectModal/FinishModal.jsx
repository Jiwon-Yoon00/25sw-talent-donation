import "./FinishModal.css";

const FinishModal = ({ result, onClose, onRetry }) => {
  return (
    <div className="finish-modal-backdrop">
      <div className="finish-modal">
        <h2>연습 완료</h2>

        <div className="finish-stats">
          <div>평균 타수: {result.avgWpm} WPM</div>
          <div>최고 타수: {result.maxWpm} WPM</div>
          <div>정확도: {result.accuracy}%</div>
          <div>소요 시간: {result.elapsedTime}s</div>
          <div>오타 수: {result.wrongTyped}</div>
        </div>

        <div className="finish-actions">
          <button onClick={onRetry}>다시 하기</button>
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default FinishModal;
