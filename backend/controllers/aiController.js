const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.1-70b-versatile';

// ─── Helper: call Groq with a system + user prompt ───────────────────────────
const callGroq = async (systemPrompt, userPrompt, maxTokens = 900) => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: maxTokens,
    temperature: 0.5
  });
  return completion.choices[0]?.message?.content || '';
};

// ─── POST /ai/forecast-insights ──────────────────────────────────────────────
const getForecastInsights = async (req, res, next) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.json({
        success: true,
        data: {
          narrative: 'AI insights unavailable — GROQ_API_KEY not configured.',
          risks: [],
          actions: [],
          repInsights: {}
        }
      });
    }

    const { historicalData = [], forecastData = [], salespersonStats = [] } = req.body;

    // ── Build a compact summary to keep token count low ──────────────────────
    const historySummary = historicalData.slice(-6).map(d =>
      `${d.month}: Revenue ₹${Math.round(d.revenue / 1000)}k, Profit ₹${Math.round(d.profit / 1000)}k, Margin ${d.profit_margin}%, MoM Growth ${d.growth_rate}%`
    ).join('\n');

    const forecastSummary = forecastData.map(d =>
      `${d.month}: Forecast Revenue ₹${Math.round(d.revenue / 1000)}k, Profit ₹${Math.round(d.profit / 1000)}k, Margin ${d.profit_margin}%`
    ).join('\n');

    const repSummary = salespersonStats.map(sp =>
      `${sp.name} (${sp.region_name}): Total Sales ₹${Math.round(sp.total_sales / 1000)}k, Orders ${sp.order_count}, Performance Score ${sp.score}/100, Status: ${sp.status}`
    ).join('\n');

    const systemPrompt = `You are a senior sales analytics AI for an Indian B2B sales company called SalesPulse. 
All currency is in Indian Rupees (₹). You give concise, actionable strategic advice based on real sales data.
Always respond in strict JSON format with no markdown, no code fences, just raw JSON.`;

    const userPrompt = `Analyze this sales data and return a JSON object with EXACTLY this structure:
{
  "narrative": "2-3 sentence executive summary of the current trend and forecast outlook",
  "risks": ["risk 1 (max 12 words)", "risk 2", "risk 3"],
  "actions": ["action 1 (max 12 words)", "action 2", "action 3"],
  "repInsights": {
    "<name>": "personalized coaching tip in 10-15 words"
  }
}

Historical Monthly Data (last 6 months):
${historySummary}

3-Month Forecast:
${forecastSummary}

Sales Rep Performance:
${repSummary}

Important: Return ONLY valid JSON. No explanation. No markdown.`;

    const raw = await callGroq(systemPrompt, userPrompt, 900);

    let parsed;
    try {
      // Strip any accidental markdown fences
      const cleaned = raw.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback if parsing fails
      parsed = {
        narrative: raw.substring(0, 300),
        risks: [],
        actions: [],
        repInsights: {}
      };
    }

    return res.json({ success: true, data: parsed });
  } catch (error) {
    // Never crash the app — return graceful fallback
    console.error('[AI Forecast Insights Error]:', error.message);
    return res.json({
      success: true,
      data: {
        narrative: 'AI insights temporarily unavailable. The forecast data below is still accurate.',
        risks: [],
        actions: [],
        repInsights: {}
      }
    });
  }
};

// ─── POST /ai/chat ────────────────────────────────────────────────────────────
const chatWithForecast = async (req, res, next) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.json({
        success: true,
        data: { answer: 'AI chat unavailable — GROQ_API_KEY not configured.' }
      });
    }

    const { message, context = {} } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const { historicalData = [], forecastData = [], salespersonStats = [] } = context;

    const contextSummary = [
      historicalData.slice(-3).map(d => `${d.month}: Rev ₹${Math.round(d.revenue / 1000)}k`).join(', '),
      forecastData.map(d => `${d.month}: Forecast ₹${Math.round(d.revenue / 1000)}k`).join(', '),
      `Top reps: ${salespersonStats.slice(0, 3).map(sp => `${sp.name} (score ${sp.score})`).join(', ')}`
    ].filter(Boolean).join(' | ');

    const systemPrompt = `You are SalesPulse AI, a concise sales analytics assistant for an Indian B2B company. 
All currency is INR. Answer in 2-4 sentences max. Be direct and actionable.
Data context: ${contextSummary}`;

    const answer = await callGroq(systemPrompt, message, 250);
    return res.json({ success: true, data: { answer: answer.trim() } });
  } catch (error) {
    console.error('[AI Chat Error]:', error.message);
    return res.json({
      success: true,
      data: { answer: 'Sorry, I could not process that question right now. Please try again.' }
    });
  }
};

module.exports = { getForecastInsights, chatWithForecast };
