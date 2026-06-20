export default function ResearchForm({ topic, context, loading, onTopicChange, onContextChange, onSubmit }) {
  return (
    <form className="research-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="topic">Research Topic</label>
        <input
          id="topic"
          type="text"
          placeholder="e.g. Renewable energy adoption in India"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="context">
          Source / Context <span className="optional">(optional)</span>
        </label>
        <textarea
          id="context"
          placeholder="Paste articles, notes, or raw content to ground the analysis..."
          value={context}
          onChange={(e) => onContextChange(e.target.value)}
          disabled={loading}
          rows={5}
        />
      </div>

      <button type="submit" className="submit-btn" disabled={loading || !topic.trim()}>
        {loading ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Researching…
          </>
        ) : (
          'Generate Research Brief'
        )}
      </button>
    </form>
  )
}
