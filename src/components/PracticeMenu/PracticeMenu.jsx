const PracticeMenu = ({ avgWpm, maxWpm, accuracy, elapsedTime }) => {
  return (
    <div>
      <p>경과 시간: {elapsedTime || '0:00'}</p>
      <p>평균 타수: {avgWpm || 0}</p>
      <p>최고 타수: {maxWpm || 0}</p>
      <p>정확도: {accuracy !== undefined ? `${accuracy.toFixed(1)}%` : '0%'}</p>
    </div>
  );
}

export default PracticeMenu;