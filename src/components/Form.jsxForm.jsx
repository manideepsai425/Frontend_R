import React, { useState, useEffect } from 'react'
import { fetchOptions } from '../api'

// ── Per-crop smart defaults (mirrors backend CROP_DEFAULTS) ──
const CROP_DEFAULTS = {
  Brinjal:  { shelf_life_days: 5,   price_per_quintal: 10056 },
  Cabbage:  { shelf_life_days: 7,   price_per_quintal: 12229 },
  Chilli:   { shelf_life_days: 180, price_per_quintal: 12567 },
  Maize:    { shelf_life_days: 180, price_per_quintal: 12734 },
  Onion:    { shelf_life_days: 30,  price_per_quintal: 11160 },
  Potato:   { shelf_life_days: 60,  price_per_quintal: 12959 },
  Rice:     { shelf_life_days: 365, price_per_quintal: 11931 },
  Tomato:   { shelf_life_days: 5,   price_per_quintal: 10805 },
  Turmeric: { shelf_life_days: 365, price_per_quintal: 11400 },
  Wheat:    { shelf_life_days: 365, price_per_quintal: 18438 },
}

const today = new Date()
const DEFAULT_FORM = {
  crop: '', region: '', season: '',
  weather_temp: '', rainfall_mm: '', humidity_pct: '58',
  month: String(today.getMonth() + 1),
  day_of_week: String(today.getDay()),
  is_weekend: String(today.getDay() >= 6 ? 1 : 0),
  festival_flag: '0', holiday_flag: '0',
  price_per_quintal: '', fuel_price: '98.6',
  transport_cost: '409.6', crop_yield: '3878',
  shelf_life_days: '', market_arrival: '136.8',
  demand_lag_1: '1342', demand_lag_7: '1342',
  avg_7day_demand: '1342', avg_30day_demand: '1342',
}

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Form({ onSubmit, loading }) {
  const [form, setForm]       = useState(DEFAULT_FORM)
  const [errors, setErrors]   = useState({})
  const [options, setOptions] = useState({ crops: [], regions: [], seasons: [] })
  const [optErr, setOptErr]   = useState(false)

  useEffect(() => {
    fetchOptions()
      .then(r => setOptions(r.data))
      .catch(() => {
        setOptErr(true)
        setOptions({
          crops:   ['Brinjal','Cabbage','Chilli','Maize','Onion','Potato','Rice','Tomato','Turmeric','Wheat'],
          regions: ['Andhra Pradesh','Karnataka','Maharashtra','Tamil Nadu','Telangana'],
          seasons: ['Kharif','Rabi','Summer'],
        })
      })
  }, [])

  useEffect(() => {
    if (form.crop && CROP_DEFAULTS[form.crop]) {
      const d = CROP_DEFAULTS[form.crop]
      setForm(f => ({
        ...f,
        shelf_life_days:   String(d.shelf_life_days),
        price_per_quintal: String(d.price_per_quintal),
      }))
    }
  }, [form.crop])

  useEffect(() => {
    const dow = parseInt(form.day_of_week)
    if (!isNaN(dow)) setForm(f => ({ ...f, is_weekend: String(dow >= 5 ? 1 : 0) }))
  }, [form.day_of_week])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(err => ({ ...err, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.crop)   e.crop   = 'Required'
    if (!form.region) e.region = 'Required'
    if (!form.season) e.season = 'Required'
    if (form.weather_temp === '' || isNaN(form.weather_temp)) e.weather_temp = 'Required (°C)'
    if (form.rainfall_mm  === '' || isNaN(form.rainfall_mm))  e.rainfall_mm  = 'Required (mm)'
    if (form.humidity_pct === '' || isNaN(form.humidity_pct)) e.humidity_pct = 'Required (%)'
    if (form.price_per_quintal === '' || isNaN(form.price_per_quintal)) e.price_per_quintal = 'Required'
    if (form.shelf_life_days   === '' || isNaN(form.shelf_life_days))   e.shelf_life_days   = 'Required'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const num = (v, fb = 0) => v === '' ? fb : parseFloat(v)
    const int = (v, fb = 0) => v === '' ? fb : parseInt(v)
    onSubmit({
      crop: form.crop, region: form.region, season: form.season,
      weather_temp:      num(form.weather_temp),
      rainfall_mm:       num(form.rainfall_mm),
      humidity_pct:      num(form.humidity_pct, 58),
      month:             int(form.month, today.getMonth() + 1),
      day_of_week:       int(form.day_of_week, today.getDay()),
      is_weekend:        int(form.is_weekend, 0),
      festival_flag:     int(form.festival_flag, 0),
      holiday_flag:      int(form.holiday_flag, 0),
      price_per_quintal: num(form.price_per_quintal, 12000),
      fuel_price:        num(form.fuel_price, 98.6),
      transport_cost:    num(form.transport_cost, 409.6),
      crop_yield:        int(form.crop_yield, 3878),
      shelf_life_days:   int(form.shelf_life_days, 30),
      market_arrival:    num(form.market_arrival, 136.8),
      demand_lag_1:      num(form.demand_lag_1, 1342),
      demand_lag_7:      num(form.demand_lag_7, 1342),
      avg_7day_demand:   num(form.avg_7day_demand, 1342),
      avg_30day_demand:  num(form.avg_30day_demand, 1342),
    })
  }

  const handleReset = () => { setForm(DEFAULT_FORM); setErrors({}) }

  const Field = ({ name, label, icon, unit = '', placeholder = '' }) => (
    <div className={`form-group ${errors[name] ? 'has-error' : ''}`}>
      <label htmlFor={name}><span className="label-icon">{icon}</span>{label}</label>
      <div className="input-wrapper">
        <input type="number" id={name} name={name} value={form[name]}
          onChange={handleChange} placeholder={placeholder}
          disabled={loading} step="any" />
        {unit && <span className="input-unit">{unit}</span>}
      </div>
      {errors[name] && <span className="error-msg">{errors[name]}</span>}
    </div>
  )

  const Select = ({ name, label, icon, opts }) => (
    <div className={`form-group ${errors[name] ? 'has-error' : ''}`}>
      <label htmlFor={name}><span className="label-icon">{icon}</span>{label}</label>
      <div className="select-wrapper">
        <select id={name} name={name} value={form[name]} onChange={handleChange} disabled={loading}>
          <option value="">Select…</option>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <span className="select-arrow">▾</span>
      </div>
      {errors[name] && <span className="error-msg">{errors[name]}</span>}
    </div>
  )

  const SelectRaw = ({ name, label, icon, children }) => (
    <div className="form-group">
      <label htmlFor={name}><span className="label-icon">{icon}</span>{label}</label>
      <div className="select-wrapper">
        <select id={name} name={name} value={form[name]} onChange={handleChange} disabled={loading}>
          {children}
        </select>
        <span className="select-arrow">▾</span>
      </div>
    </div>
  )

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <div className="form-header">
        <span className="form-tag">Supply Chain Model</span>
        <h2 className="form-title">Run Prediction</h2>
        <p className="form-subtitle">
          Fields marked <span className="req-badge">required</span> must be filled. All others are pre-filled with real dataset averages.
        </p>
        {optErr && <p className="options-warn">⚠️ Backend offline — using built-in defaults.</p>}
      </div>

      {/* Section 1 */}
      <div className="form-section">
        <p className="section-label">🌾 Crop Information <span className="req-badge">required</span></p>
        <div className="form-grid-3">
          <Select name="crop"   label="Crop"   icon="🌱" opts={options.crops} />
          <Select name="region" label="Region" icon="📍" opts={options.regions} />
          <Select name="season" label="Season" icon="🌦️" opts={options.seasons} />
        </div>
      </div>

      {/* Section 2 */}
      <div className="form-section">
        <p className="section-label">🌡️ Weather Conditions <span className="req-badge">required</span></p>
        <div className="form-grid-3">
          <Field name="weather_temp" label="Temperature" icon="🌡️" unit="°C" placeholder="e.g. 32" />
          <Field name="rainfall_mm"  label="Rainfall"    icon="🌧️" unit="mm" placeholder="e.g. 57" />
          <Field name="humidity_pct" label="Humidity"    icon="💧" unit="%"  placeholder="e.g. 58" />
        </div>
      </div>

      {/* Section 3 */}
      <div className="form-section">
        <p className="section-label">📅 Date Context <span className="opt-badge">auto-filled</span></p>
        <div className="form-grid-3">
          <SelectRaw name="month" label="Month" icon="📆">
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </SelectRaw>
          <SelectRaw name="day_of_week" label="Day of Week" icon="📅">
            {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </SelectRaw>
          <SelectRaw name="is_weekend" label="Weekend?" icon="🗓️">
            <option value="0">No (Weekday)</option>
            <option value="1">Yes (Weekend)</option>
          </SelectRaw>
        </div>
      </div>

      {/* Section 4 */}
      <div className="form-section">
        <p className="section-label">📦 Market & Logistics <span className="opt-badge">auto-filled from crop</span></p>
        <div className="form-grid-3">
          <Field name="price_per_quintal" label="Price / Quintal" icon="💰" unit="₹"    placeholder="e.g. 12000" />
          <Field name="market_arrival"    label="Market Arrival"  icon="🚚" unit="tons" placeholder="e.g. 136" />
          <Field name="crop_yield"        label="Crop Yield"      icon="🌿" unit="kg"   placeholder="e.g. 3878" />
          <Field name="shelf_life_days"   label="Shelf Life"      icon="📦" unit="days" placeholder="e.g. 30" />
          <Field name="transport_cost"    label="Transport Cost"  icon="🛻" unit="₹"    placeholder="e.g. 409" />
          <Field name="fuel_price"        label="Fuel Price"      icon="⛽" unit="₹/L"  placeholder="e.g. 98" />
        </div>
      </div>

      {/* Section 5 */}
      <div className="form-section">
        <p className="section-label">🎌 Event Flags <span className="opt-badge">auto-filled</span></p>
        <div className="form-grid-2">
          <SelectRaw name="festival_flag" label="Festival Day?" icon="🪔">
            <option value="0">No</option>
            <option value="1">Yes</option>
          </SelectRaw>
          <SelectRaw name="holiday_flag" label="Public Holiday?" icon="🏖️">
            <option value="0">No</option>
            <option value="1">Yes</option>
          </SelectRaw>
        </div>
      </div>

      {/* Section 6 */}
      <div className="form-section">
        <p className="section-label">📊 Demand History <span className="opt-badge">auto-filled</span></p>
        <div className="form-grid-2">
          <Field name="demand_lag_1"    label="Yesterday's Demand" icon="📉" unit="units" placeholder="e.g. 1342" />
          <Field name="demand_lag_7"    label="7-day Lag Demand"   icon="📅" unit="units" placeholder="e.g. 1342" />
          <Field name="avg_7day_demand" label="7-day Avg Demand"   icon="📈" unit="units" placeholder="e.g. 1342" />
          <Field name="avg_30day_demand"label="30-day Avg Demand"  icon="📊" unit="units" placeholder="e.g. 1342" />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-reset" onClick={handleReset} disabled={loading}>Clear</button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading
            ? <span className="btn-loading"><span className="spinner" />Analysing…</span>
            : <><span>Run Analysis</span><span className="btn-arrow">→</span></>
          }
        </button>
      </div>
    </form>
  )
}
