import React, { useState } from 'react'
import Form from './components/Form'
import Results from './components/Results'
import { predictSupplyChain } from './api'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [lastInput, setLastInput] = useState(null)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    setResults(null)
    setLastInput(formData)

    try {
      const res = await predictSupplyChain(formData)
      setResults(res.data)
    } catch (err) {
      if (err.response) {
        const detail = err.response.data?.detail || err.response.data?.message || JSON.stringify(err.response.data)
        setError(`Server error ${err.response.status}: ${detail}`)
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. The server may be waking up (cold start). Please try again in a moment.')
      } else if (err.request) {
        setError('No response from server. Please check your connection or try again later.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-root">
      {/* Decorative background elements */}
      <div className="bg-grain" />
      <div className="bg-circle bg-circle-1" />
      <div className="bg-circle bg-circle-2" />

      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🌾</span>
            <span className="logo-text">HarvestIQ</span>
          </div>
          <nav className="header-nav">
            <span className="nav-pill">Food Supply Chain Intelligence</span>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">Powered by AI</p>
          <h1 className="hero-title">
            Predict. Analyse.<br />
            <em>Optimise.</em>
          </h1>
          <p className="hero-desc">
            Enter your crop parameters and get real-time predictions on demand, supply gaps,
            and spoilage risk — helping you make smarter distribution decisions.
          </p>
        </div>
      </section>

      {/* Main content */}
      <main className="main-content">
        <div className="content-grid">
          <div className="form-column">
            <Form onSubmit={handleSubmit} loading={loading} />
          </div>
          <div className="results-column">
            {!results && !error && !loading && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p className="empty-title">No results yet</p>
                <p className="empty-desc">Fill in the form and click <strong>Run Analysis</strong> to see predictions.</p>
                <ul className="empty-hints">
                  <li>📦 <strong>Demand</strong> — estimated market need</li>
                  <li>⚖️ <strong>Supply Gap</strong> — surplus or deficit</li>
                  <li>🔴 <strong>Spoilage Risk</strong> — environmental risk level</li>
                </ul>
              </div>
            )}
            {loading && (
              <div className="loading-state">
                <div className="loading-animation">
                  <div className="pulse-ring" />
                  <span className="loading-icon">🌾</span>
                </div>
                <p className="loading-title">Analysing supply chain…</p>
                <p className="loading-desc">Running AI model on your parameters</p>
              </div>
            )}
            <Results data={results} error={error} inputParams={lastInput} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>HarvestIQ &mdash; Food Supply Chain AI &nbsp;·&nbsp; Built with FastAPI + React</p>
      </footer>
    </div>
  )
    }
