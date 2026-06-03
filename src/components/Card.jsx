function Card({ symbol, label, red }) {
  return (
    <span className={red ? 'unicode-card red' : 'unicode-card'} aria-label={label}>
      {symbol}
    </span>
  )
}

export default Card
