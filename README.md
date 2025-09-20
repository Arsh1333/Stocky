# 📊 Stocky Backend 

This project implements a backend system for **Stocky**, where users can earn shares of Indian stocks as rewards.  
The system tracks user rewards, company ledger entries, and provides APIs to query holdings and portfolio valuation.

---

## 🚀 Tech Stack
- Node.js + Express (Backend APIs)
- PostgreSQL (Database)
- pg (Node.js Postgres client)
- dotenv (for environment variables)

---

## 📌 API Endpoints

### 1. POST `/reward`
Record that a user has been rewarded X shares of a stock.

**Request Body**
```json
{
  "userId": 1,
  "stockSymbol": "RELIANCE",
  "shares": 2.5
}
```
```response
{
  "message": "Reward recorded",
  "reward": {
    "id": 1,
    "user_id": 1,
    "stock_symbol": "RELIANCE",
    "shares": "2.500000",
    "rewarded_at": "2025-09-19T12:10:00.000Z"
  }
}
```
### 2. GET /today-stocks/:userId
Fetch all rewards for the user for today.
```
[
  {
    "id": 1,
    "user_id": 1,
    "stock_symbol": "RELIANCE",
    "shares": "2.500000",
    "rewarded_at": "2025-09-19T12:10:00.000Z"
  }
]
```
### 3. GET /historical-inr/:userId
Fetch the INR value of user’s stock rewards for all past days
```
[
  {
    "day": "2025-09-18",
    "total_inr": "5000.00"
  }
]
```
### 4. GET /stats/:userId
Fetch total shares rewarded today + current INR portfolio value.
```
{
  "today": [
    {
      "stock_symbol": "RELIANCE",
      "total_shares": "2.500000"
    }
  ],
  "portfolio": [
    {
      "stock": "RELIANCE",
      "shares": "2.500000",
      "currentValueINR": "6450.00"
    }
  ]
}
```
### 5. GET /portfolio/:userId
Fetch current holdings per stock with INR value.
```
[
  {
    "stock": "RELIANCE",
    "shares": "2.500000",
    "currentValueINR": "6450.00"
  }
]
```
## Run Locally

### 1. Clone repo
```bash
git clone <your-repo-url>
cd stocky-backend
```
### 2. Install Dependancies 
```bash
npm install
```
### 3. Set Up Your PostgreSQL
```sql
CREATE USER devuser WITH PASSWORD 'yourpassword';
CREATE DATABASE mydb OWNER devuser;
```
### 4. Create Tables 
```
\c mydb
\i schema.sql
```
### 5. Run Server
```
npm start
```
## Edge Case Handling
- Duplicate rewards / replay attacks : use unique transaction IDs or UNIQUE constraints in DB.
- Stock splits / mergers / delisting : maintain an adjustment table and apply corrections to existing rewards.
- Rounding errors : all amounts use NUMERIC type instead of floating-point.
- Price API downtime : fallback to last cached price or retry mechanism.

## Scaling Explanation
- Indexes : add indexes on (user_id, stock_symbol) to speed up queries.
- Background jobs : use a scheduler (e.g., cron job) to refresh stock prices hourly.
- Caching : store frequently used portfolio values in Redis for quick retrieval.
- Microservices : split reward service, ledger service, and price service into independent services for high traffic.
- Horizontal scaling : deploy multiple instances of the backend behind a load balancer.
