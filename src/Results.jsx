import React from 'react'

function getRisk(label) {
  if (!label) return null
  const isHigh = label.toUpperCase().includes('HIGH')
  return isHigh
    ? { level: 'high', color: 'risk-high', icon: '🔴' }
    : { level: 'low',  color: 'risk-low',  icon: '🟢' }
}

function getGap(val) {
  if (val === undefined || val === null) return null
  const n = typeof val === 'number' ? val : parseFloat(val)
  if (n < 0) return { color: 'gap-deficit', icon: '▼', note: 'Deficit',  display: n.toLocaleString(undefined,{maximumFractionDigits:0}) }
  if (n > 0) return { color: 'gap-surplus', icon: '▲', note: 'Surplus',  display: `+${n.toLocaleString(undefined,{maximumFractionDigits:0})}` }
  return       { color: 'gap-neutral', icon: '↔', note: 'Balanced', display: '0' }
}

export default function Results({ data, error, inputParams }) {
  if (error) {
    return (
      <div className="results-area">
        <div className="error-card">
          <span className="error-icon">⚠️</span>
          <div>
            <p className="error-title">Prediction Failed</p>
            <p className="error-body">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const gap  = getGap(data.predicted_supply_gap)
  const risk = getRisk(data.spoilage_risk_label)

  return (
    <div className="results-area">
      <div className="results-header">
        <span className="results-tag">AI Prediction Results</span>
        {inputParams && (
          <p className="results-meta">
            {inputParams.crop} · {inputParams.region} · {inputParams.season} · {inputParams.weather_temp}°C · {inputParams.rainfall_mm}mm
          </p>
        )}
      </div>

      {data.alert && (
        <div className={`alert-banner ${data.alert.includes('⚠️') ? 'alert-warn' : 'alert-ok'}`}>
          {data.alert}
        </div>
      )}

      <div className="results-grid">
        {/* Demand */}
        <div className="result-card demand-card">
          <div className="card-icon-wrap"><span className="card-icon">📦</span></div>
          <div className="card-content">
            <p className="card-label">Predicted Demand</p>
            <p className="card-value">
              {data.predicted_demand !== undefined
                ? data.predicted_demand.toLocaleString(undefined,{maximumFractionDigits:0})
                : '—'}
              <span className="card-unit"> units</span>
            </p>
            <p className="card-desc">Estimated market demand based on crop, region, and environmental conditions.</p>
          </div>
          <div className="card-bar"><div className="card-bar-fill demand-bar" style={{width:'72%'}} /></div>
        </div>

        {/* Gap */}
        <div className={`result-card gap-card ${gap?.color || ''}`}>
          <div className="card-icon-wrap"><span className="card-icon">⚖️</span></div>
          <div className="card-content">
            <p className="card-label">Supply–Demand Gap</p>
            <p className="card-value gap-value">
              {gap ? <><span className="gap-icon">{gap.icon}</span>{gap.display}<span className="card-unit"> units</span></> : '—'}
            </p>
            {gap?.note && <span className="card-badge">{gap.note}</span>}
            <p className="card-desc">Difference between projected supply and predicted demand.</p>
          </div>
        </div>

        {/* Spoilage */}
        <div className={`result-card risk-card ${risk?.color || ''}`}>
          <div className="card-icon-wrap"><span className="card-icon">{risk?.icon || '🔵'}</span></div>
          <div className="card-content">
            <p className="card-label">Spoilage Risk</p>
            <p className="card-value">{data.spoilage_risk_label || '—'}</p>
            {data.spoilage_risk_probability !== undefined && (
              <div className="risk-prob-bar">
                <div className="risk-prob-track">
                  <div className={`risk-prob-fill ${risk?.level}`}
                    style={{width:`${Math.min(data.spoilage_risk_probability,100)}%`}} />
                </div>
                <span className="risk-prob-label">{data.spoilage_risk_probability.toFixed(1)}% probability</span>
              </div>
            )}
            <p className="card-desc">Likelihood of crop spoilage based on weather and logistics factors.</p>
          </div>
          {risk && (
            <div className="risk-indicator">
              <div className={`risk-dot ${risk.level}`} />
              <div className={`risk-dot ${risk.level === 'high' ? risk.level : ''}`} />
              <div className={`risk-dot ${risk.level === 'high' ? risk.level : ''}`} />
            </div>
          )}
        </div>
      </div>

      <details className="raw-response">
        <summary>View full API response</summary>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </details>
    </div>
  )
}
