const Groq = require('groq-sdk');

// Lazy client — reads process.env at request time (after dotenv.config() has run)
const getGroqClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'qwen/qwen3.8-27b';

// ─── Helper: call Groq with a system + user prompt ───────────────────────────
const callGroq = async (systemPrompt, userPrompt, maxTokens = 900) => {
  const groq = getGroqClient();
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

    const safeHistorical = Array.isArray(historicalData) ? historicalData.slice(-12) : [];
    const safeForecast = Array.isArray(forecastData) ? forecastData.slice(0, 6) : [];
    const safeSalesperson = Array.isArray(salespersonStats) ? salespersonStats.slice(0, 20) : [];

    // ── Build a compact summary to keep token count low ──────────────────────
    const historySummary = safeHistorical.slice(-6).map(d =>
      `${d.month}: Revenue ₹${Math.round(Number(d.revenue || 0) / 1000)}k, Profit ₹${Math.round(Number(d.profit || 0) / 1000)}k, Margin ${d.profit_margin}%, MoM Growth ${d.growth_rate}%`
    ).join('\n');

    const forecastSummary = safeForecast.map(d =>
      `${d.month}: Forecast Revenue ₹${Math.round(Number(d.revenue || 0) / 1000)}k, Profit ₹${Math.round(Number(d.profit || 0) / 1000)}k, Margin ${d.profit_margin}%`
    ).join('\n');

    const repSummary = safeSalesperson.map(sp =>
      `${String(sp.name || 'Rep').slice(0, 30)} (${String(sp.region_name || 'Zone').slice(0, 20)}): Total Sales ₹${Math.round(Number(sp.total_sales || 0) / 1000)}k, Orders ${sp.order_count}, Performance Score ${sp.score}/100, Status: ${sp.status}`
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
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'A valid text message is required.' });
    }

    const cleanMessage = message.trim();
    if (cleanMessage.length === 0 || cleanMessage.length > 500) {
      return res.status(400).json({ success: false, message: 'Message must be between 1 and 500 characters.' });
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
