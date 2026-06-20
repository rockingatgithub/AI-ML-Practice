function ListSection({ title, items, variant }) {
  if (!items?.length) return null

  return (
    <section className={`result-section result-section--${variant}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export default function ResearchResults({ data, topic }) {
  const isOpportunities = data.analysisType === 'opportunities-risks'
  const positiveLabel = isOpportunities ? 'Opportunities' : 'Pros'
  const negativeLabel = isOpportunities ? 'Risks' : 'Cons'

  return (
    <div className="results">
      <header className="results-header">
        <span className="results-label">Research Brief</span>
        <h2>{topic}</h2>
      </header>

      <ListSection title="Key Points" items={data.keyPoints} variant="key-points" />

      <div className="analysis-grid">
        <ListSection title={positiveLabel} items={data.positives} variant="positive" />
        <ListSection title={negativeLabel} items={data.negatives} variant="negative" />
      </div>

      <section className="result-section result-section--recommendation">
        <h3>Recommendation</h3>
        <p>{data.recommendation}</p>
      </section>
    </div>
  )
}
