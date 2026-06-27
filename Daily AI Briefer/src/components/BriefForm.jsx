export default function BriefForm({ topic, loading, onTopicChange, onSubmit }) {
  return (
    <form className="brief-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="topic">Topic</label>
        <input
          id="topic"
          type="text"
          placeholder="e.g. Artificial Intelligence, Remote Jobs, Cryptocurrency"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          disabled={loading}
        />
      </div>

      <button type="submit" className="submit-btn" disabled={loading || !topic.trim()}>
        {loading ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Generating…
          </>
        ) : (
          'Generate Brief'
        )}
      </button>
    </form>
  )
}
