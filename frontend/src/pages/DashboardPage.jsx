import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { KpiCard } from '../components/KpiCard';
import { formatCurrency, formatNumber } from '../utils/formatters';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

export const DashboardPage = ({ dataVersion = 0 }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState('');

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const url = regionFilter ? `/dashboard/summary?region_id=${regionFilter}` : '/dashboard/summary';
      const res = await apiFetch(url);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [regionFilter, dataVersion]);

  if (loading || !data) {
    return <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading summary...</div>;
  }

  const { kpis, top_performers, sales_trend, category_breakdown, region_breakdown } = data;

  // Compute real MoM revenue growth from actual trend data
  const computeGrowth = () => {
    if (!sales_trend || sales_trend.length < 2) return 0;
    const last = parseFloat(sales_trend[sales_trend.length - 1]?.revenue) || 0;
    const prev = parseFloat(sales_trend[sales_trend.length - 2]?.revenue) || 1;
    return parseFloat(((last - prev) / prev * 100).toFixed(1));
  };
  const momGrowth = computeGrowth();
  const profitGrowth = sales_trend && sales_trend.length >= 2
    ? parseFloat((((parseFloat(sales_trend[sales_trend.length - 1]?.profit) || 0) - (parseFloat(sales_trend[sales_trend.length - 2]?.profit) || 1)) / (parseFloat(sales_trend[sales_trend.length - 2]?.profit) || 1) * 100).toFixed(1))
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Company Summary</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Key financial metrics and revenue performance</span>
        </div>
        <select
          className="input-field"
          style={{ width: '220px' }}
          value={regionFilter}
          onChange={e => setRegionFilter(e.target.value)}
        >
          <option value="">All Indian Regions</option>
          <option value="1">North India (Delhi NCR)</option>
          <option value="2">West India (Mumbai & Pune)</option>
          <option value="3">South India (Bengaluru)</option>
          <option value="4">Central India (Hyderabad)</option>
          <option value="5">East India (Kolkata)</option>
        </select>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(kpis.total_revenue)}
          subtext="Total revenue earned"
          trend={momGrowth}
          icon={DollarSign}
          color="#6366f1"
        />
        <KpiCard
          title="Total Orders"
          value={formatNumber(kpis.total_orders)}
          subtext="Completed deals"
          trend={momGrowth}
          icon={ShoppingBag}
          color="#ec4899"
        />
        <KpiCard
          title="Gross Profit"
          value={formatCurrency(kpis.total_profit)}
          subtext={`Margin: ${kpis.total_revenue > 0 ? (kpis.total_profit / kpis.total_revenue * 100).toFixed(1) : 0}%`}
          trend={profitGrowth}
          icon={TrendingUp}
          color="#10b981"
        />
        <KpiCard
          title="Quota Achievement"
          value={`${kpis.target_achievement_pct}%`}
          subtext={`Target: ${formatCurrency(kpis.total_target)}`}
          trend={kpis.target_achievement_pct >= 100 ? 10 : -5}
          icon={Target}
          color="#f59e0b"
        />
      </div>

      {/* Main Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Revenue & Profit Growth Trend */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Revenue & Profit Trend</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly financial growth</span>
            </div>
            <span className="badge badge-info">Monthly</span>
          </div>
          <div style={{ width: '100%', height: 290 }}>
            <ResponsiveContainer>
              <AreaChart data={sales_trend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={val => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  formatter={(value) => [formatCurrency(value)]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Revenue Distribution Pie Chart */}
        <div className="glass-card">
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Sales by Category</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue breakdown by product type</span>
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={category_breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="revenue"
                  nameKey="category"
                >
                  {category_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  formatter={(val) => [formatCurrency(val)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Regional Performance & Top Performers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Regional Sales Bar Chart */}
        <div className="glass-card">
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Sales by Region</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Regional revenue totals</span>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={region_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="code" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={val => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  formatter={(val) => [formatCurrency(val)]}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers Highlights */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Top Performers</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Highest sales rep & product</span>
          </div>

          <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={20} color="#6366f1" />
            </div>
            <div>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 500 }}>Top Sales Rep</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{top_performers.top_salesperson.name}</p>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-success)' }}>
                {formatCurrency(top_performers.top_salesperson.total_sales)}
              </span>
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} color="#ec4899" />
            </div>
            <div>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 500 }}>Top Product</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{top_performers.top_product.product_name}</p>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                {formatCurrency(top_performers.top_product.total_sales)} ({top_performers.top_product.total_qty} units)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
