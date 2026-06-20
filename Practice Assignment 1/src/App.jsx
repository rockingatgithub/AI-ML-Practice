import { useState } from 'react'
import ResearchForm from './components/ResearchForm'
import ResearchResults from './components/ResearchResults'
import { researchTopic } from './services/gemini'
import './App.css'

function App() {
  const [topic, setTopic] = useState('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [activeTopic, setActiveTopic] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const data = await researchTopic(topic, context)
      setResults(data)
      setActiveTopic(topic)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="logo-mark" aria-hidden="true">🔬</div>
          <div>
            <h1>Topic Research Assistant</h1>
            <p>Enter a topic and get a structured research brief powered by Gemini.</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <ResearchForm
          topic={topic}
          context={context}
          loading={loading}
          onTopicChange={setTopic}
          onContextChange={setContext}
          onSubmit={handleSubmit}
        />

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        {results && <ResearchResults data={results} topic={activeTopic} />}
      </main>

      <footer className="app-footer">
        Powered by Google Gemini API
      </footer>
    </div>
  )
}

export default App
