import React, { useEffect, useState, useContext, useRef } from 'react';
import { apiFetch } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { formatCurrency } from '../utils/formatters';
import {
  TrendingUp, Sliders, BarChart2, Users,
  Sparkles, RefreshCw, Send, Bot, AlertTriangle, Zap
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ─── AI Skeleton Loader ───────────────────────────────────────────────────────
const AiSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {[80, 60, 90, 50].map((w, i) => (
      <div key={i} style={{
        height: '13px', borderRadius: '6px', width: `${w}%`,
        background: 'linear-gradient(90deg, var(--bg-input) 25%, var(--border-color) 50%, var(--bg-input) 75%)',
        backgroundSize: '200% 100%',
        animation: 'aiShimmer 1.4s infinite'
      }} />
    ))}
  </div>
);

export const AdvancedAnalyticsPage = ({ dataVersion = 0 }) => {
  const { addToast } = useContext(NotificationContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Scenario Simulator Inputs
  const [targetMultiplier, setTargetMultiplier] = useState(1.15);
  const [priceMultiplier, setPriceMultiplier] = useState(1.05);
  const [commissionRate, setCommissionRate] = useState(5.5);
  const [simResult, setSimResult] = useState(null);

  // AI state
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const chatInputRef = useRef(null);

  const fetchAdvanced = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/analytics/advanced');
      setData(res.data);
      return res.data;
    } catch (e) {
      addToast(e.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    try {
      const res = await apiFetch('/analytics/what-if', {
        method: 'POST',
        body: JSON.stringify({
          target_multiplier: targetMultiplier,
          price_multiplier: priceMultiplier,
          commission_rate: commissionRate
        })
      });
      setSimResult(res.data);
    } catch (e) {
      addToast(e.message, 'danger');
    }
  };

  // ── Fetch AI insights using the analytics data ──────────────────────────────
  const fetchAiInsights = async (analyticsData) => {
    if (!analyticsData) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await apiFetch('/ai/forecast-insights', {
        method: 'POST',
        body: JSON.stringify({
          historicalData: analyticsData.historical_monthly || [],
          forecastData: analyticsData.forecast || [],
          salespersonStats: analyticsData.performer_predictions || []
        })
      });
      if (res.success) {
        setAiInsights(res.data);
      }
    } catch (e) {
      setAiError('AI insights temporarily unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  // ── Send chat message ───────────────────────────────────────────────────────
  const sendChat = async () => {
    const msg = chatMessage.trim();
    if (!msg || chatLoading) return;
    setChatLoading(true);
    setChatResponse(null);
    try {
      const res = await apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: msg,
          context: {
            historicalData: data?.historical_monthly || [],
            forecastData: data?.forecast || [],
            salespersonStats: data?.performer_predictions || []
          }
        })
      });
      if (res.success) {
        setChatResponse(res.data.answer);
        setChatMessage('');
      }
    } catch (e) {
      setChatResponse('Sorry, could not get an answer right now.');
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const analyticsData = await fetchAdvanced();
      await runSimulation();
      await fetchAiInsights(analyticsData);
    };
    init();
  }, [dataVersion]);

  useEffect(() => {
    runSimulation();
  }, [targetMultiplier, priceMultiplier, commissionRate]);

  if (loading || !data) {
    return <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading forecasting model...</div>;
  }

  const combinedTrend = [
    ...(data.historical_monthly || []).map(d => ({ ...d, isForecast: false })),
    ...(data.forecast || [])
  ];

  const marginTrend = combinedTrend.map(d => ({
    month: d.month,
    profit_margin: d.profit_margin || 0,
    isForecast: !!d.isForecast
  }));

  const CustomDot = ({ cx, cy, payload, color }) => {
    if (!payload.isForecast) return null;
    return <circle cx={cx} cy={cy} r={4} stroke={color} strokeWidth={2} fill="#fff" />;
  };

  // Build rep insights map from AI response
  const repInsights = aiInsights?.repInsights || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── Shimmer keyframe (injected once) ── */}
      <style>{`
        @keyframes aiShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .ai-pulse-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 9px; border-radius: 20px; font-size: 0.72rem; font-weight: 600;
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15));
          border: 1px solid rgba(99,102,241,0.3); color: var(--accent-primary);
        }
        .ai-chat-input { flex: 1; padding: 9px 13px; border-radius: 10px;
          border: 1px solid var(--border-color); background: var(--bg-input);
          color: var(--text-primary); font-size: 0.85rem; outline: none; }
        .ai-chat-input:focus { border-color: var(--accent-primary); }
        .ai-send-btn { padding: 9px 16px; border-radius: 10px; border: none; cursor: pointer;
          background: var(--accent-primary); color: #fff; font-size: 0.85rem; font-weight: 600;
          display: flex; align-items: center; gap: 6px; transition: opacity 0.2s; }
        .ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ai-send-btn:hover:not(:disabled) { opacity: 0.88; }
      `}</style>

      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Sales Forecast & Scenario Simulator</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Project future sales revenue, simulate pricing scenarios, and review client loyalty tiers
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          AI FORECAST INSIGHTS CARD
      ══════════════════════════════════════════════════════════════ */}
      <div className="glass-card" style={{ borderLeft: '3px solid var(--accent-primary)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles size={17} color="var(--accent-primary)" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>AI Forecast Insights</h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Powered by Llama 3.1 70B via Groq
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="ai-pulse-badge">
              <Bot size={11} /> AI Analysis
            </span>
            <button
              onClick={() => fetchAiInsights(data)}
              disabled={aiLoading}
              style={{
                padding: '5px 11px', borderRadius: '8px', border: '1px solid var(--border-color)',
                background: 'var(--bg-input)', cursor: aiLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem',
                color: 'var(--text-secondary)', opacity: aiLoading ? 0.5 : 1
              }}
            >
              <RefreshCw size={12} style={{ animation: aiLoading ? 'spin 1s linear infinite' : 'none' }} />
              Regenerate
            </button>
          </div>
        </div>

        {/* Content */}
        {aiLoading ? (
          <AiSkeleton />
        ) : aiError ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <AlertTriangle size={15} color="#f59e0b" /> {aiError}
          </div>
        ) : aiInsights ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Narrative */}
            <p style={{
              fontSize: '0.88rem', lineHeight: 1.65, color: 'var(--text-secondary)',
              margin: 0, padding: '10px 14px', borderRadius: '8px',
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)'
            }}>
              {aiInsights.narrative}
            </p>

            {/* Risks + Actions */}
            {(aiInsights.risks?.length > 0 || aiInsights.actions?.length > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {/* Risks */}
                {aiInsights.risks?.length > 0 && (
                  <div style={{
                    padding: '12px', borderRadius: '10px',
                    background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 700, fontSize: '0.8rem', color: '#ef4444' }}>
                      <AlertTriangle size={13} /> Risk Flags
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {aiInsights.risks.map((r, i) => (
                        <li key={i} style={{ fontSize: '0.81rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Actions */}
                {aiInsights.actions?.length > 0 && (
                  <div style={{
                    padding: '12px', borderRadius: '10px',
                    background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 700, fontSize: '0.8rem', color: '#10b981' }}>
                      <Zap size={13} /> Recommended Actions
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {aiInsights.actions.map((a, i) => (
                        <li key={i} style={{ fontSize: '0.81rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click Regenerate to load AI insights.</div>
        )}
      </div>

      {/* 1. Dual Revenue + Profit Forecast Chart */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp color="var(--accent-primary)" size={18} />
              3-Month Revenue & Profit Outlook
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Blended LR + Weighted Moving Average forecast · Dashed = projected
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-info">Forecast Model</span>
            <span className="badge badge-success">Blended WMA+LR</span>
          </div>
        </div>

        <div style={{ width: '100%', height: 290 }}>
          <ResponsiveContainer>
            <AreaChart data={combinedTrend}>
              <defs>
                <linearGradient id="colorRevFull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfitFull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={val => `₹${(val / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                formatter={(val, name) => [formatCurrency(val), name]}
                labelFormatter={label => {
                  const pt = combinedTrend.find(d => d.month === label);
                  return `${label}${pt?.isForecast ? ' (Forecast)' : ''}`;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5}
                fill="url(#colorRevFull)" name="Revenue" dot={<CustomDot color="#6366f1" />} />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2}
                fill="url(#colorProfitFull)" name="Profit" dot={<CustomDot color="#10b981" />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Profit Margin Trend Chart */}
      <div className="glass-card">
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 color="#ec4899" size={18} />
            Profit Margin % Trend
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Month-over-month profit margin percentage · Dashed = projected
          </span>
        </div>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <LineChart data={marginTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={val => `${val}%`} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                formatter={(val) => [`${val}%`, 'Profit Margin']}
                labelFormatter={label => {
                  const pt = marginTrend.find(d => d.month === label);
                  return `${label}${pt?.isForecast ? ' (Forecast)' : ''}`;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '4px' }} />
              <Line type="monotone" dataKey="profit_margin" stroke="#ec4899" strokeWidth={2.5}
                strokeDasharray="5 3" name="Profit Margin %"
                dot={{ r: 3, fill: '#ec4899' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Goal Simulator & Client Tiers */}
      <div className="grid-two-col">
        {/* Scenario Simulator */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders color="#ec4899" size={18} />
            Goal & Pricing Simulator
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Target Growth: {Math.round((targetMultiplier - 1) * 100)}%</span>
                <span>{targetMultiplier}x</span>
              </div>
              <input type="range" min="0.8" max="1.5" step="0.05" value={targetMultiplier}
                onChange={e => setTargetMultiplier(parseFloat(e.target.value))} style={{ width: '100%' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Price Adjustment: {Math.round((priceMultiplier - 1) * 100)}%</span>
                <span>{priceMultiplier}x</span>
              </div>
              <input type="range" min="0.9" max="1.3" step="0.02" value={priceMultiplier}
                onChange={e => setPriceMultiplier(parseFloat(e.target.value))} style={{ width: '100%' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Commission Rate: {commissionRate}%</span>
              </div>
              <input type="range" min="3.0" max="10.0" step="0.5" value={commissionRate}
                onChange={e => setCommissionRate(parseFloat(e.target.value))} style={{ width: '100%' }} />
            </div>
          </div>

          {simResult && (
            <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-input)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>Estimated Revenue</span>
                <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-primary)', margin: 0 }}>
                  {formatCurrency(simResult.simulated.revenue)}
                </p>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-success)' }}>
                  +{formatCurrency(simResult.simulated.revenue_lift)} lift
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>Estimated Profit</span>
                <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-success)', margin: 0 }}>
                  {formatCurrency(simResult.simulated.profit)}
                </p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Commission Pool: {formatCurrency(simResult.simulated.commission_pool)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Client Tiers */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Client Accounts Loyalty Tiers</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span className="badge badge-success">Top Accounts</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0 0 0' }}>{data.customer_segmentation.champions.length} Clients</p>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>High revenue & orders</span>
            </div>
            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <span className="badge badge-info">Loyal Clients</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0 0 0' }}>{data.customer_segmentation.loyalists.length} Clients</p>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Repeat purchase history</span>
            </div>
            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <span className="badge badge-warning">New Clients</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0 0 0' }}>{data.customer_segmentation.new_promising.length} Clients</p>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>First-time orders</span>
            </div>
            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <span className="badge badge-danger">Needs Attention</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0 0 0' }}>{data.customer_segmentation.at_risk.length} Clients</p>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Inactive account follow-up</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sales Rep Performance Table — with AI coaching column */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={17} color="var(--accent-primary)" />
            Sales Rep Performance Insights & Coaching
          </h4>
          {aiInsights && (
            <span className="ai-pulse-badge">
              <Sparkles size={11} /> AI-Enhanced Coaching
            </span>
          )}
        </div>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Sales Representative</th>
                <th>Region</th>
                <th>Performance Index</th>
                <th>Status</th>
                <th>{aiInsights ? '🤖 AI Coaching Tip' : 'Recommended Next Steps'}</th>
              </tr>
            </thead>
            <tbody>
              {data.performer_predictions.map(p => (
                <tr key={p.salesperson_id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.region_name}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{p.score} / 100</td>
                  <td>
                    <span className={`badge ${p.status.includes('High') ? 'badge-success' : p.status.includes('Risk') ? 'badge-warning' : 'badge-info'}`}>
                      {p.status.replace('AI ', '')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {aiLoading ? (
                      <div style={{
                        height: '11px', borderRadius: '4px', width: '70%',
                        background: 'linear-gradient(90deg, var(--bg-input) 25%, var(--border-color) 50%, var(--bg-input) 75%)',
                        backgroundSize: '200% 100%', animation: 'aiShimmer 1.4s infinite'
                      }} />
                    ) : (repInsights[p.name] || p.recommendation)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          ASK THE FORECAST — Mini AI Chat
      ══════════════════════════════════════════════════════════════ */}
      <div className="glass-card" style={{ borderLeft: '3px solid #10b981' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Bot size={17} color="#10b981" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>Ask the Forecast</h4>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Ask follow-up questions about your sales data
            </span>
          </div>
        </div>

        {/* Suggestion chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {[
            'Which region should we focus on next quarter?',
            'Who needs the most coaching support?',
            'How can we improve our profit margin?'
          ].map(suggestion => (
            <button
              key={suggestion}
              onClick={() => { setChatMessage(suggestion); chatInputRef.current?.focus(); }}
              style={{
                padding: '4px 11px', borderRadius: '20px', border: '1px solid var(--border-color)',
                background: 'var(--bg-input)', fontSize: '0.76rem', cursor: 'pointer',
                color: 'var(--text-secondary)', transition: 'border-color 0.2s'
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            ref={chatInputRef}
            className="ai-chat-input"
            placeholder="e.g. What would happen if we hired 2 more reps in South India?"
            value={chatMessage}
            onChange={e => setChatMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendChat()}
          />
          <button className="ai-send-btn" onClick={sendChat} disabled={chatLoading || !chatMessage.trim()}>
            {chatLoading
              ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
              : <Send size={14} />}
            {chatLoading ? 'Thinking...' : 'Ask'}
          </button>
        </div>

        {/* Response */}
        {chatResponse && (
          <div style={{
            marginTop: '12px', padding: '12px 14px', borderRadius: '10px',
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)',
            fontSize: '0.87rem', lineHeight: 1.65, color: 'var(--text-secondary)',
            display: 'flex', gap: '10px', alignItems: 'flex-start'
          }}>
            <Bot size={16} color="#10b981" style={{ marginTop: '1px', flexShrink: 0 }} />
            <span>{chatResponse}</span>
          </div>
        )}
      </div>

    </div>
  );
};
