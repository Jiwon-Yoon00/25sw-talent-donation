import './TypingSummaryCard.css';

const TypingSummaryCard = ({title, stats}) => {
  return (
    <div className="typing-summary-card">
      <p className="typing-summary-card-title">{title}</p>
      <p className="typing-summary-card-stats">{stats}</p>
    </div>
  )
}

export default TypingSummaryCard;