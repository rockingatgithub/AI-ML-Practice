export default function BriefCard({ data, topic }) {
  return (
    <article className="brief-card">
      <header className="brief-card__header">
        <span className="brief-card__label">Daily Brief</span>
        <p className="brief-card__topic">Topic: {topic}</p>
        <h2 className="brief-card__title">{data.title}</h2>
      </header>

      <section className="brief-section brief-section--key-points">
        <h3>Key Points</h3>
        <ul>
          {data.keyPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </section>

      <section className="brief-section brief-section--insight">
        <h3>Insight</h3>
        <p>{data.insight}</p>
      </section>

      <section className="brief-section brief-section--action">
        <h3>Action Step</h3>
        <p>{data.actionStep}</p>
      </section>
    </article>
  )
}
