import React, { useEffect, useState, useContext } from 'react';
import { apiFetch } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, Sliders, BarChart2, Users } from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export const AdvancedAnalyticsPage = ({ dataVersion = 0 }) => {
  const { addToast } = useContext(NotificationContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Scenario Simulator Inputs
  const [targetMultiplier, setTargetMultiplier] = useState(1.15);
  const [priceMultiplier, setPriceMultiplier] = useState(1.05);
  const [commissionRate, setCommissionRate] = useState(5.5);
  const [simResult, setSimResult] = useState(null);

  const fetchAdvanced = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/analytics/advanced');
      setData(res.data);
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

  useEffect(() => {
    fetchAdvanced();
    runSimulation();
  }, [dataVersion]);

  useEffect(() => {
    runSimulation();
  }, [targetMultiplier, priceMultiplier, commissionRate]);

  if (loading || !data) {
    return <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading forecasting model...</div>;
  }

  // Combine historical + forecast into one series; mark forecast months visually
  const combinedTrend = [
    ...(data.historical_monthly || []).map(d => ({ ...d, isForecast: false })),
    ...(data.forecast || [])
  ];

  // Profit margin trend data (historical + forecast)
  const marginTrend = combinedTrend.map(d => ({
    month: d.month,
    profit_margin: d.profit_margin || 0,
    isForecast: !!d.isForecast
  }));

  // Custom dot: solid for historical, open circle for forecast
  const CustomDot = ({ cx, cy, payload, color }) => {
    if (!payload.isForecast) return null;
    return <circle cx={cx} cy={cy} r={4} stroke={color} strokeWidth={2} fill="#fff" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Sales Forecast & Scenario Simulator</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Project future sales revenue, simulate pricing scenarios, and review client loyalty tiers
        </span>
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
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={val => `$${(val / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                formatter={(val, name) => [formatCurrency(val), name]}
                labelFormatter={label => {
                  const pt = combinedTrend.find(d => d.month === label);
                  return `${label}${pt?.isForecast ? ' (Forecast)' : ''}`;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2.5}
                strokeDasharray={combinedTrend.some(d => d.isForecast) ? undefined : undefined}
                fill="url(#colorRevFull)"
                name="Revenue"
                dot={<CustomDot color="#6366f1" />}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorProfitFull)"
                name="Profit"
                dot={<CustomDot color="#10b981" />}
              />
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
              <Line
                type="monotone"
                dataKey="profit_margin"
                stroke="#ec4899"
                strokeWidth={2.5}
                strokeDasharray="5 3"
                name="Profit Margin %"
                dot={{ r: 3, fill: '#ec4899' }}
                activeDot={{ r: 5 }}
              />
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
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                value={targetMultiplier}
                onChange={e => setTargetMultiplier(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Price Adjustment: {Math.round((priceMultiplier - 1) * 100)}%</span>
                <span>{priceMultiplier}x</span>
              </div>
              <input
                type="range"
                min="0.9"
                max="1.3"
                step="0.02"
                value={priceMultiplier}
                onChange={e => setPriceMultiplier(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Commission Rate: {commissionRate}%</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="10.0"
                step="0.5"
                value={commissionRate}
                onChange={e => setCommissionRate(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Simulation Output */}
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

      {/* 4. Sales Rep Growth Table */}
      <div className="glass-card">
        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '12px' }}>Sales Rep Performance Insights & Coaching</h4>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Sales Representative</th>
                <th>Region</th>
                <th>Performance Index</th>
                <th>Status</th>
                <th>Recommended Next Steps</th>
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
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{p.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
