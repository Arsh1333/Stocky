import express from "express";
import pool from "./db/db.js";
import { getStockPrice } from "./priceService.js";
const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/reward", async (req, res) => {
  const { userId, stockSymbol, shares } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO rewards (user_id, stock_symbol, shares) 
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, stockSymbol, shares]
    );

    const price = getStockPrice(stockSymbol);
    const inrOutflow = (shares * price).toFixed(2);

    await pool.query(
      `INSERT INTO ledger (reward_id, stock_symbol, shares, inr_outflow, fees) 
       VALUES ($1, $2, $3, $4, $5)`,
      [result.rows[0].id, stockSymbol, shares, inrOutflow, 20]
    );

    res.json({ message: "Reward recorded", reward: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error inserting reward" });
  }
});

app.get("/today-stocks/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM rewards 
       WHERE user_id = $1 AND DATE(rewarded_at) = CURRENT_DATE`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching today's stocks" });
  }
});

app.get("/historical-inr/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT DATE(rewarded_at) as day, 
              SUM(shares * 2000) as total_inr -- using base price
       FROM rewards
       WHERE user_id = $1 AND DATE(rewarded_at) < CURRENT_DATE
       GROUP BY day
       ORDER BY day DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching historical INR" });
  }
});

app.get("/stats/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const today = await pool.query(
      `SELECT stock_symbol, SUM(shares) as total_shares
       FROM rewards
       WHERE user_id = $1 AND DATE(rewarded_at) = CURRENT_DATE
       GROUP BY stock_symbol`,
      [userId]
    );

    const rewards = await pool.query(
      `SELECT stock_symbol, SUM(shares) as total_shares
       FROM rewards
       WHERE user_id = $1
       GROUP BY stock_symbol`,
      [userId]
    );

    const portfolio = rewards.rows.map((r) => {
      const price = getStockPrice(r.stock_symbol);
      return {
        stock: r.stock_symbol,
        shares: r.total_shares,
        currentValueINR: (r.total_shares * price).toFixed(2),
      };
    });

    res.json({
      today: today.rows,
      portfolio,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching stats" });
  }
});

app.get("/portfolio/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT stock_symbol, SUM(shares) as total_shares
       FROM rewards
       WHERE user_id = $1
       GROUP BY stock_symbol`,
      [userId]
    );

    const portfolio = result.rows.map((r) => ({
      stock: r.stock_symbol,
      shares: r.total_shares,
      currentValueINR: (r.total_shares * getStockPrice(r.stock_symbol)).toFixed(
        2
      ),
    }));

    res.json(portfolio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching portfolio" });
  }
});

app.listen(3000, () => {
  console.log(`Server running on port 3000 `);
});
