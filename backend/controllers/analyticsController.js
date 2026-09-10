const { query, queryOne } = require('../config/db');

const getAdvancedAnalytics = async (req, res, next) => {
  try {
    // 1. Historical monthly data for forecasting
    const monthlyData = await query(`
      SELECT 
        STRFTIME('%Y-%m', sale_date) as month,
        SUM(amount) as revenue,
        SUM(profit) as profit,
        COUNT(sale_id) as orders
      FROM Sales
      WHERE status = 'Completed'
      GROUP BY month
      ORDER BY month ASC
    `);

    // Enrich historical data with MoM growth rate and profit margin
    const enrichedMonthly = monthlyData.map((d, i) => {
      const revenue = parseFloat(d.revenue) || 0;
      const profit = parseFloat(d.profit) || 0;
      const prevRevenue = i > 0 ? (parseFloat(monthlyData[i - 1].revenue) || 0) : revenue;
      const growthRate = prevRevenue > 0 ? parseFloat(((revenue - prevRevenue) / prevRevenue * 100).toFixed(1)) : 0;
      const profitMargin = revenue > 0 ? parseFloat((profit / revenue * 100).toFixed(1)) : 0;
      return { ...d, revenue, profit, growth_rate: growthRate, profit_margin: profitMargin };
    });

    // Blended Forecast: Linear Regression + Weighted Moving Average (WMA)
    const forecast = [];
    if (enrichedMonthly.length > 0) {
      const n = enrichedMonthly.length;

      // Linear Regression
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      enrichedMonthly.forEach((d, i) => {
        sumX += i; sumY += d.revenue; sumXY += i * d.revenue; sumXX += i * i;
      });
      const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) : 0;
      const intercept = (sumY - slope * sumX) / n;

      // Weighted Moving Average (last 3 months, weights: 3,2,1)
      const wmaWindow = enrichedMonthly.slice(-3);
      const wmaWeights = [1, 2, 3].slice(3 - wmaWindow.length);
      const wmaSum = wmaWindow.reduce((acc, d, i) => acc + d.revenue * wmaWeights[i], 0);
      const wmaBase = wmaWeights.reduce((a, b) => a + b, 0);
      const wmaRevenue = wmaSum / wmaBase;

      // Average profit margin over last 3 months
      const recentMargins = enrichedMonthly.slice(-3).map(d => d.profit_margin);
      const avgMargin = recentMargins.reduce((a, b) => a + b, 0) / recentMargins.length;

      // Project next 3 months — blend LR (40%) and WMA (60%) for accuracy
      const futureMonths = ['2026-10', '2026-11', '2026-12'];
      let prevForecastRev = wmaRevenue;
      futureMonths.forEach((m, idx) => {
        const lrRev = intercept + slope * (n + idx);
        const blended = Math.max(Math.round(lrRev * 0.4 + prevForecastRev * 0.6), 30000);
        const projectedProfit = Math.round(blended * (avgMargin / 100));
        const profitMargin = parseFloat((projectedProfit / blended * 100).toFixed(1));
        forecast.push({ month: m, revenue: blended, profit: projectedProfit, profit_margin: profitMargin, isForecast: true });
        prevForecastRev = blended;
      });
    }


    // 2. Performer Prediction Matrix
    const salespersonStats = await query(`
      SELECT 
        sp.salesperson_id,
        sp.name,
        r.region_name,
        COALESCE(SUM(s.amount), 0) as total_sales,
        COALESCE(COUNT(s.sale_id), 0) as order_count,
        COALESCE(AVG(s.amount), 0) as avg_sale
      FROM Salespersons sp
      LEFT JOIN Regions r ON sp.region_id = r.region_id
      LEFT JOIN Sales s ON sp.salesperson_id = s.salesperson_id AND s.status = 'Completed'
      GROUP BY sp.salesperson_id, sp.name, r.region_name
    `);

    const performerPredictions = salespersonStats.map((sp, idx) => {
      const sales = parseFloat(sp.total_sales);
      const score = Math.min(Math.round((sales / 150000) * 100), 100);
      let status = 'High Performer';
      let recommendation = 'Eligible for quarterly bonus and enterprise accounts';

      if (score < 50) {
        status = 'Needs Support / At Risk';
        recommendation = 'Assign targeted sales coaching and mid-tier lead allocation';
      } else if (score < 80) {
        status = 'Consistent Contributor';
        recommendation = 'Good growth trajectory; expand product cross-selling';
      }

      return {
        ...sp,
        score,
        status,
        recommendation
      };
    });

    // 3. Customer RFM Segmentation Matrix
    const rfmData = await query(`
      SELECT 
        c.customer_id,
        c.name,
        c.company,
        COUNT(s.sale_id) as frequency,
        SUM(s.amount) as monetary,
        MAX(s.sale_date) as recency_date
      FROM Customers c
      LEFT JOIN Sales s ON c.customer_id = s.customer_id
      GROUP BY c.customer_id, c.name, c.company
    `);

    const segments = {
      champions: [],
      loyalists: [],
      at_risk: [],
      new_promising: []
    };

    rfmData.forEach(c => {
      const monetary = parseFloat(c.monetary) || 0;
      const freq = parseInt(c.frequency) || 0;

      if (monetary > 50000 && freq >= 3) {
        segments.champions.push({ ...c, monetary, segment: 'Champions' });
      } else if (monetary > 20000 || freq >= 2) {
        segments.loyalists.push({ ...c, monetary, segment: 'Loyalists' });
      } else if (freq === 1) {
        segments.new_promising.push({ ...c, monetary, segment: 'New / Promising' });
      } else {
        segments.at_risk.push({ ...c, monetary, segment: 'At-Risk' });
      }
    });

    res.json({
      success: true,
      data: {
        historical_monthly: enrichedMonthly,
        forecast,
        performer_predictions: performerPredictions,
        customer_segmentation: segments
      }
    });
  } catch (error) {
    next(error);
  }
};

const simulateWhatIf = async (req, res, next) => {
  try {
    const { target_multiplier = 1.1, price_multiplier = 1.05, commission_rate = 5.5 } = req.body;

    const baseStats = await queryOne(`
      SELECT 
        SUM(amount) as base_revenue,
        SUM(profit) as base_profit,
        COUNT(sale_id) as total_sales
      FROM Sales WHERE status = 'Completed'
    `);

    const baseRev = parseFloat(baseStats.base_revenue) || 0;
    const baseProfit = parseFloat(baseStats.base_profit) || 0;

    const simulatedRevenue = Math.round(baseRev * parseFloat(target_multiplier) * parseFloat(price_multiplier));
    const simulatedProfit = Math.round(simulatedRevenue * 0.68);
    const simulatedCommissionPool = Math.round(simulatedRevenue * (parseFloat(commission_rate) / 100));

    res.json({
      success: true,
      data: {
        base: {
          revenue: baseRev,
          profit: baseProfit,
          commission_pool: Math.round(baseRev * 0.05)
        },
        simulated: {
          revenue: simulatedRevenue,
          profit: simulatedProfit,
          commission_pool: simulatedCommissionPool,
          revenue_lift: simulatedRevenue - baseRev,
          profit_lift: simulatedProfit - baseProfit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdvancedAnalytics,
  simulateWhatIf
};
