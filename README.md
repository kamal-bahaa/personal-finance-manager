# Personal Finance Manager — Backend API

RESTful API for personal finance management, built with **Node.js**, **Express 5**, **MongoDB**, and **JWT** authentication. It provides full CRUD operations for expenses, income, goals, and budgets, alongside rich analytics, a monthly summary engine, and a real-time dashboard overview — giving any frontend everything it needs to build a comprehensive personal finance application.

---

## Features

- **JWT Auth** — Secure access + refresh token flow with token rotation and revocation on logout
- **Expenses** — Track spending by category with date filtering and pagination
- **Income** — Log income entries by source with the same filter/pagination pattern
- **Goals** — Savings goal tracking with automatic `completed` status when target is reached
- **Budgets** — Per-month, per-category budget plans (one budget per user per month)
- **Dashboard** — Current-month snapshot: total income, expenses, balance, and 5 most recent transactions
- **Analytics** — Aggregated charts data: yearly trend, category breakdown, monthly spending, top categories, biggest expense, income by source
- **Monthly Summary** — Budget vs. actual breakdown per category with over-budget alerts and usage percentages
- **Profile** — View, update, change password, and delete account (cascades all user data)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 |
| Framework | Express 5.x |
| Database | MongoDB + Mongoose |
| Authentication | JWT (Access + Refresh Tokens) |
| Validation | express-validator |
| Password Hashing | bcrypt |
| Dev Server | nodemon |

---

## Project Structure

```
personal-finance-manager/
│
├── server.js                   # Entry point — connects DB then starts server
├── package.json
│
└── src/
    ├── app.js                  # Express app setup, CORS, routes, middleware
    ├── config/
    │   └── db.js               # Mongoose connection
    ├── models/
    │   ├── user.model.js
    │   ├── token.model.js      # Refresh tokens (TTL index for auto-expiry)
    │   ├── expense.model.js
    │   ├── income.model.js
    │   ├── goal.model.js       # Auto-sets status to "completed" via pre-save hook
    │   └── budget.model.js     # Unique index: one budget per user per month
    ├── middlewares/
    │   ├── auth.middleware.js   # JWT verification, attaches req.user
    │   ├── validate.middleware.js  # express-validator error formatter
    │   ├── errorHandler.js     # Global error handler (stack trace in dev)
    │   └── notFound.js         # 404 catch-all
    ├── utils/
    │   ├── AppError.js         # Custom error class with statusCode + status
    │   ├── ApiResponse.js      # sendSuccess / sendFail helpers
    │   └── asyncWrapper.js     # Wraps async controllers to pass errors to next()
    └── modules/
        ├── auth/               # register, login, refresh, logout
        ├── expense/            # CRUD + filters
        ├── income/             # CRUD + filters
        ├── goal/               # CRUD + auto-complete logic
        ├── budget/             # CRUD + get by month
        ├── dashboard/          # Current-month overview
        ├── analytics/          # Aggregation-heavy chart endpoints
        ├── summary/            # Monthly budget vs. actual report
        └── profile/            # View, update, change password, delete account
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/kamal-bahaa/personal-finance-manager.git
cd personal-finance-manager

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in the values (see Environment Variables section)

# 4. Start the development server
npm run dev
```

---

## Environment Variables

```env
NODE_ENV=development
PORT=5000

MONGO_URI=mongodb://localhost:27017/personal-finance-manager

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=15m

REFRESH_TOKEN_SECRET=your_refresh_secret_here
REFRESH_TOKEN_EXPIRES_IN=7d

CLIENT_URL=http://localhost:4200
```

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Login and receive access + refresh tokens |
| `POST` | `/api/auth/refresh` | No | Get a new access token using a refresh token |
| `POST` | `/api/auth/logout` | Yes | Logout and revoke the refresh token |

**Register body:** `{ name, email, password }`

**Login body:** `{ email, password }`  → returns `{ accessToken, refreshToken, user }`

**Refresh body:** `{ refreshToken }`  → returns `{ accessToken }`

**Logout body:** `{ refreshToken }`

---

### Expenses

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/expenses` | Yes | Add a new expense |
| `GET` | `/api/expenses` | Yes | Get all expenses (filters + pagination) |
| `PATCH` | `/api/expenses/:id` | Yes | Update an expense |
| `DELETE` | `/api/expenses/:id` | Yes | Delete an expense |

**GET query params:** `category`, `startDate`, `endDate`, `page` (default: 1), `limit` (default: 10)

**Categories:** `Food` | `Transport` | `Shopping` | `Bills` | `Other`

---

### Income

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/income` | Yes | Add a new income record |
| `GET` | `/api/income` | Yes | Get all income (filters + pagination) |
| `PATCH` | `/api/income/:id` | Yes | Update an income record |
| `DELETE` | `/api/income/:id` | Yes | Delete an income record |

**GET query params:** `source`, `startDate`, `endDate`, `page`, `limit`

**Sources:** `Salary` | `Freelance` | `Business` | `Investment` | `Other`

---

### Goals

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/goals` | Yes | Create a new savings goal |
| `GET` | `/api/goals` | Yes | Get all goals (filters + pagination) |
| `PATCH` | `/api/goals/:id` | Yes | Update a goal |
| `DELETE` | `/api/goals/:id` | Yes | Delete a goal |

**GET query params:** `status` (`in-progress` | `completed`), `page`, `limit`

> **Auto-complete:** Goal `status` automatically switches to `completed` when `currentAmount >= targetAmount` via a Mongoose pre-save hook.

---

### Budget

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/budget` | Yes | Create a budget for a specific month |
| `GET` | `/api/budget` | Yes | Get all budgets |
| `GET` | `/api/budget/:month` | Yes | Get budget by month (e.g. `2025-01`) |
| `PATCH` | `/api/budget/:id` | Yes | Update category limits for a budget |
| `DELETE` | `/api/budget/:id` | Yes | Delete a budget |

> Only one budget is allowed per user per month (enforced via a unique compound index on `userId + month`).

**Budget body example:**
```json
{
  "month": "2025-01",
  "categories": {
    "Food": 500,
    "Transport": 200,
    "Shopping": 300,
    "Bills": 150,
    "Other": 100
  }
}
```

---

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/dashboard/overview` | Yes | Current-month summary + 5 most recent transactions |

**Response includes:** `totalIncome`, `totalExpenses`, `balance`, transaction counts, goal stats, and a `recentTransactions` array (merged expenses + income, sorted by date).

---

### Analytics

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/analytics/yearly-trend` | Yes | Monthly income vs. expense totals for a year |
| `GET` | `/api/analytics/expense-category` | Yes | Total spending grouped by category |
| `GET` | `/api/analytics/monthly-spending` | Yes | Month-by-month expense totals (all time) |
| `GET` | `/api/analytics/top-categories` | Yes | Top N spending categories |
| `GET` | `/api/analytics/biggest-expense` | Yes | Single largest expense record |
| `GET` | `/api/analytics/income-source` | Yes | Total income grouped by source |

**Query params:**
- `year` (integer) — for `yearly-trend` (defaults to current year)
- `limit` (integer) — for `top-categories` (default: 5)

---

### Summary

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/summary/monthly` | Yes | Full budget vs. actual report for a given month |

**Query params:** `month` (**required**, format: `YYYY-MM`, e.g. `?month=2025-01`)

**Response includes per category:** `limit`, `spent`, `remaining`, `isOverBudget`, `usedPercent` — plus top-level `totalIncome`, `totalExpenses`, `totalBudget`, `balance`, and `remainingBudget`.

---

### Profile

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/profile` | Yes | Get current user profile |
| `PATCH` | `/api/profile` | Yes | Update name or email |
| `PATCH` | `/api/profile/password` | Yes | Change password |
| `DELETE` | `/api/profile` | Yes | Delete account and all associated data |

**Change password body:** `{ currentPassword, newPassword, confirmPassword }`

> Changing password invalidates all existing refresh tokens, requiring a fresh login.

> Deleting the account permanently removes all expenses, income, goals, budgets, and tokens for that user.

---

## Response Format

### Success
```json
{
  "status": "success",
  "message": "optional message",
  "data": {}
}
```

### Client Error (4xx)
```json
{
  "status": "fail",
  "message": "Descriptive error message"
}
```

### Validation Error (400)
```json
{
  "status": "fail",
  "errors": [
    { "field": "email", "message": "Valid email is required" }
  ]
}
```

### Server Error (5xx)
```json
{
  "status": "error",
  "message": "Internal Server Error",
  "stack": "..." 
}
```
> `stack` is only included in `development` mode.

---

## Authentication Flow

All protected routes require the header:

```
Authorization: Bearer <accessToken>
```

Access tokens expire in **15 minutes** by default. Use the refresh endpoint to get a new one without re-logging in. Refresh tokens expire in **7 days** and are stored in MongoDB with a TTL index for automatic cleanup.

```
1. POST /api/auth/register     → create account
2. POST /api/auth/login        → get accessToken + refreshToken
3. (use API with Bearer token)
4. POST /api/auth/refresh      → get new accessToken when expired
5. POST /api/auth/logout       → revoke refreshToken
```

---

## Health Check

```
GET /health
```

Returns `{ "status": "ok" }` when the server is running.

---

## Error Handling Architecture

- **`AppError`** — Custom error class. Pass `message`, `statusCode`, and `status` (`"fail"` for client errors, `"error"` for server errors).
- **`asyncWrapper`** — Wraps every async controller so unhandled promise rejections are automatically forwarded to Express's error handler via `next(err)`.
- **`errorHandler`** — Global Express error middleware. Formats all errors into the standard response shape and includes stack traces in development.
- **`notFound`** — Catch-all for undefined routes, returns a `404` with the attempted URL.

---

## Data Models Summary

| Model | Key Fields | Notes |
|---|---|---|
| `User` | `name`, `email`, `password` | Password stored as bcrypt hash |
| `Token` | `userId`, `token`, `expiresAt` | TTL index auto-deletes expired tokens |
| `Expense` | `userId`, `title`, `amount`, `category`, `date`, `isRecurring`, `notes` | Categories: Food, Transport, Shopping, Bills, Other |
| `Income` | `userId`, `title`, `amount`, `source`, `date`, `notes` | Sources: Salary, Freelance, Business, Investment, Other |
| `Goal` | `userId`, `title`, `targetAmount`, `currentAmount`, `deadline`, `status`, `notes` | Status auto-set by pre-save hook |
| `Budget` | `userId`, `month`, `categories{}` | Unique per user+month; YYYY-MM format |

---

## Testing with Postman

1. `POST /api/auth/register` — create an account
2. `POST /api/auth/login` — copy the `accessToken` from the response
3. Add `Authorization: Bearer <accessToken>` header to all protected requests
4. When the access token expires, call `POST /api/auth/refresh` with `{ "refreshToken": "..." }` to get a new one
