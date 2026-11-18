const { query } = require('../config/db');

const getTargets = async (req, res, next) => {
  try {
    const { year = 2026, period = 'Monthly' } = req.query;

    const sql = `
      SELECT 
        t.target_id,
        t.salesperson_id,
        sp.name as salesperson_name,
        r.region_name,
        t.target_amount,
        t.achieved_amount,
        t.period,
        t.year,
        t.month,
        t.start_date,
        t.end_date,
        COALESCE(SUM(s.amount), 0) as real_time_achieved
      FROM Targets t
      LEFT JOIN Salespersons sp ON t.salesperson_id = sp.salesperson_id
      LEFT JOIN Regions r ON t.region_id = r.region_id
      LEFT JOIN Sales s ON t.salesperson_id = s.salesperson_id 
        AND s.sale_date BETWEEN t.start_date AND t.end_date
        AND s.status = 'Completed'
      WHERE t.year = ?
      GROUP BY t.target_id, t.salesperson_id, sp.name, r.region_name, t.target_amount, t.achieved_amount, t.period, t.year, t.month, t.start_date, t.end_date
      ORDER BY t.month DESC, t.target_id DESC
    `;

    const targets = await query(sql, [year]);

    const processed = targets.map(t => {
      const targetAmount = parseFloat(t.target_amount);
      const achieved = parseFloat(t.real_time_achieved) || parseFloat(t.achieved_amount) || 0;
      const achievementPct = Math.round((achieved / targetAmount) * 100);
      const status = achievementPct >= 100 ? 'Achieved' : achievementPct >= 70 ? 'On Track' : 'Behind Target';

      return {
        ...t,
        target_amount: targetAmount,
        achieved_amount: achieved,
        achievement_pct: achievementPct,
        status
      };
    });

    res.json({
      success: true,
      data: processed
    });
  } catch (error) {
    next(error);
  }
};

const VALID_PERIODS = new Set(['Monthly', 'Quarterly', 'Yearly']);

const createOrUpdateTarget = async (req, res, next) => {
  try {
    const { salesperson_id, region_id, target_amount, period = 'Monthly', year = 2026, month = 9 } = req.body;

    const numTarget = parseFloat(target_amount);
    if (isNaN(numTarget) || numTarget <= 0) {
      return res.status(400).json({ success: false, message: 'Target amount must be a positive number.' });
    }

    const numYear = parseInt(year, 10);
    const numMonth = parseInt(month, 10);
    const numSalespersonId = salesperson_id ? parseInt(salesperson_id, 10) : null;
    const numRegionId = region_id ? parseInt(region_id, 10) : null;

    if (isNaN(numYear) || numYear < 2020 || numYear > 2050) {
      return res.status(400).json({ success: false, message: 'Invalid target year.' });
    }
    if (isNaN(numMonth) || numMonth < 1 || numMonth > 12) {
      return res.status(400).json({ success: false, message: 'Target month must be between 1 and 12.' });
    }
    if (!VALID_PERIODS.has(period)) {
      return res.status(400).json({ success: false, message: 'Period must be Monthly, Quarterly, or Yearly.' });
    }

    const startDate = `${numYear}-${String(numMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(numYear, numMonth, 0).getDate();
    const endDate = `${numYear}-${String(numMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Check if target already exists for this salesperson/period
    const existing = await query(
      `SELECT * FROM Targets WHERE salesperson_id = ? AND year = ? AND month = ?`,
      [numSalespersonId, numYear, numMonth]
    );

    if (existing && existing.length > 0) {
      await query(
        `UPDATE Targets SET target_amount = ? WHERE target_id = ?`,
        [numTarget, existing[0].target_id]
      );
      return res.json({ success: true, message: 'Target record updated successfully.' });
    } else {
      const result = await query(
        `INSERT INTO Targets (salesperson_id, region_id, target_amount, achieved_amount, period, year, month, start_date, end_date)
         VALUES (?, ?, ?, 0.00, ?, ?, ?, ?, ?)`,
        [numSalespersonId, numRegionId, numTarget, period, numYear, numMonth, startDate, endDate]
      );
      return res.status(201).json({ success: true, message: 'New sales target established.', target_id: result.insertId });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTargets,
  createOrUpdateTarget
};
