# ValuePro India — Stock Valuation & Investment Toolkit

A production-ready MERN stack web application built specifically for Indian retail investors, containing 30 distinct financial calculators.

---

## 🚀 Deployment to Vercel

The application is configured for a **unified single-project Vercel deployment**. You can deploy the entire monorepo (both React frontend and Express backend) as a single project with one click!

### Step-by-Step Deployment:
1. In the Vercel Dashboard, click **New Project** and import your repository.
2. Under **Project Settings**:
   - **Framework Preset**: **Other** (Do NOT choose Vite; Vercel will use the root `vercel.json` configuration automatically).
   - **Root Directory**: Leave empty (keep as root folder `/`).
3. Under **Environment Variables**, add:
   - `JWT_SECRET`: *A secure random string* (required for user authentication)
   - `JWT_REFRESH_SECRET`: *Another secure random string*
   - `MONGO_URI`: *Your MongoDB Atlas connection string* (optional — if not provided, the server automatically falls back to the in-memory array database).
4. Click **Deploy**. Vercel will compile the Vite frontend, mount the Express backend serverless functions, and configure all routing out of the box!


---

## 🛠️ Local Development Setup

### Option 1: Direct Node.js (No Docker required)
1. **Install dependencies**:
   Run from the root directory:
   ```bash
   npm run install:all
   ```
2. **Configure Environment**:
   - Copy `server/.env.example` to `server/.env` and edit configurations.
   - Copy `client/.env.example` to `client/.env` and edit configurations.
3. **Start the applications**:
   - Start the backend: `npm run dev:server` (automatically falls back to mock DB if local Mongo is not running).
   - Start the frontend: `npm run dev:client`.
   - Open [http://localhost:5173](http://localhost:5173).

### Option 2: Docker Compose
```bash
docker-compose up --build
```
This spins up MongoDB, the Express backend, and the Vite client concurrently.

---

## 🧪 Running Tests

- **Run Backend Tests (Jest)**:
  ```bash
  npm run test:server
  ```
- **Run Frontend Tests (Vitest)**:
  ```bash
  npm run test:client
  ```

---

## 📊 Calculator Mapping & Formula Reference

| # | Calculator | Category | Formula Reference | API Route |
|---|------------|----------|-------------------|-----------|
| 1 | Intrinsic Value | Valuation | Graham / Lynch / EPV / DCF | `POST /api/calculate/intrinsic-value` |
| 2 | Margin of Safety | Valuation | `((IV - Price) / IV) * 100` | `POST /api/calculate/margin-of-safety` |
| 3 | DCF Valuation | Valuation | Gordon Growth Terminal Value + Discounted Cashflows | `POST /api/calculate/dcf` |
| 4 | P/E Fair Value | Valuation | `EPS * Industry P/E` | `POST /api/calculate/pe-fair-value` |
| 5 | PEG Ratio | Valuation | `P/E / Growth Rate` | `POST /api/calculate/peg-ratio` |
| 6 | EV/EBITDA | Valuation | `Enterprise Value / EBITDA` | `POST /api/calculate/ev-ebitda` |
| 7 | Price-to-Book | Valuation | `Share Price / Book Value Per Share` | `POST /api/calculate/price-to-book` |
| 8 | ROE | Financial Health | `Net Profit / Equity * 100` | `POST /api/calculate/roe` |
| 9 | ROCE | Financial Health | `EBIT / (Total Assets - Current Liabilities) * 100` | `POST /api/calculate/roce` |
| 10 | Debt-to-Equity | Financial Health | `Total Debt / Shareholders' Equity` | `POST /api/calculate/debt-to-equity` |
| 11 | Interest Coverage | Financial Health | `EBIT / Interest Expense` | `POST /api/calculate/interest-coverage` |
| 12 | Free Cash Flow | Cash Flow | `Operating Cash Flow - Capital Expenditures` | `POST /api/calculate/free-cash-flow` |
| 13 | CAGR | Cash Flow | `(End Value / Start Value)^(1/years) - 1` | `POST /api/calculate/cagr` |
| 14 | EPS Growth | Cash Flow | Year-over-Year growth rates + Multi-year CAGR | `POST /api/calculate/eps-growth` |
| 15 | Dividend Yield | Returns | `Dividend Per Share / Share Price * 100` | `POST /api/calculate/dividend-yield` |
| 16 | TSR | Returns | `(Capital Gains + Dividends) / Start Price * 100` | `POST /api/calculate/total-shareholder-return` |
| 17 | Portfolio Allocation | Portfolio | Sector, cap, and stock allocation + warnings | `POST /api/calculate/portfolio-allocation` |
| 18 | Position Size | Portfolio | `(Portfolio * Risk%) / (Entry Price - Stop Loss)` | `POST /api/calculate/position-size` |
| 19 | Asset Allocation | Portfolio | "100 minus age" heuristic for Indian asset classes | `POST /api/calculate/asset-allocation` |
| 20 | SIP | Portfolio | Monthly compounding growth stacked projection | `POST /api/calculate/sip` |
| 21 | Lump Sum | Portfolio | `P * (1 + r)^n` | `POST /api/calculate/lump-sum` |
| 22 | Retirement | Portfolio | Present Value of inflation-adjusted expenses + SIP | `POST /api/calculate/retirement` |
| 23 | Inflation Impact | Cash Flow | `Present Cost * (1 + inflation)^years` | `POST /api/calculate/inflation` |
| 24 | XIRR | Returns | Newton-Raphson cashflow solver | `POST /api/calculate/xirr` |
| 25 | Screener Score | Financial Health | Weighted composite 0-100 score | `POST /api/calculate/screener-score` |
| 26 | Piotroski F-Score | Financial Health | 9-point binary test checklist | `POST /api/calculate/piotroski-f-score` |
| 27 | Altman Z-Score | Financial Health | `1.2A + 1.4B + 3.3C + 0.6D + 1.0E` | `POST /api/calculate/altman-z-score` |
| 28 | Beneish M-Score | Financial Health | 8-variable earnings manipulation index | `POST /api/calculate/beneish-m-score` |
| 29 | DRIP | Returns | Year-by-year dividend reinvestment simulation | `POST /api/calculate/drip` |
| 30 | Combined Fair Value | Valuation | Side-by-side comparison of 7 valuation models | `POST /api/calculate/combined-fair-value` |

---

## 🛡️ SEBI Compliance Disclaimer

This software is for educational purposes only. It is a financial calculation engine and does not constitute investment advice or recommendation to buy/sell securities. The figures computed are estimates based on historical figures or user assumptions. Always consult a SEBI-registered financial advisor before making any actual financial investments.
