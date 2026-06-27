import { useState } from 'react'
import BriefForm from './components/BriefForm'
import BriefCard from './components/BriefCard'
import { generateBrief } from './services/gemini'
import './App.css'

function App() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [brief, setBrief] = useState(null)
  const [activeTopic, setActiveTopic] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    if (!topic.trim()) {
      setError('Please enter a topic before generating a brief.')
      return
    }

    setLoading(true)
    setError(null)
    setBrief(null)

    try {
      const data = await generateBrief(topic)
      setBrief(data)
      setActiveTopic(topic.trim())
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
          <div className="logo-mark" aria-hidden="true">📋</div>
          <div>
            <h1>Daily AI Briefer</h1>
            <p>Enter any topic and get a quick structured summary powered by Gemini.</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <BriefForm
          topic={topic}
          loading={loading}
          onTopicChange={setTopic}
          onSubmit={handleSubmit}
        />

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        {brief && <BriefCard data={brief} topic={activeTopic} />}
      </main>

      <footer className="app-footer">
        Powered by Google Gemini API
      </footer>
    </div>
  )
}

export default App
