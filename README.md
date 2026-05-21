# Personal Finance Manager — Backend API

A RESTful API for personal finance management built with Node.js, Express, MongoDB, and JWT authentication.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5.x |
| Database | MongoDB + Mongoose |
| Authentication | JWT (Access + Refresh Tokens) |
| Validation | express-validator |
| Password Hashing | bcrypt |

---

## Project Structure

```
personal-finance-manager/
│
├── server.js
├── package.json
│
└── src/
    ├── app.js
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── user.model.js
    │   ├── token.model.js
    │   ├── expense.model.js
    │   ├── income.model.js
    │   ├── goal.model.js
    │   └── budget.model.js
    ├── middlewares/
    │   ├── auth.middleware.js
    │   ├── validate.middleware.js
    │   ├── errorHandler.js
    │   └── notFound.js
    ├── utils/
    │   ├── AppError.js
    │   ├── ApiResponse.js
    │   └── asyncWrapper.js
    └── modules/
        ├── auth/
        ├── expense/
        ├── income/
        ├── goal/
        ├── budget/
        ├── dashboard/
        ├── analytics/
        ├── summary/
        └── profile/
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
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
# Fill in the required values

# 4. Start the server
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
| `POST` | `/api/auth/login` | No | Login and receive tokens |
| `POST` | `/api/auth/refresh` | No | Refresh access token |
| `POST` | `/api/auth/logout` | Yes | Logout and revoke refresh token |

### Expenses

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/expenses` | Yes | Add a new expense |
| `GET` | `/api/expenses` | Yes | Get all expenses (with filters & pagination) |
| `PATCH` | `/api/expenses/:id` | Yes | Update an expense |
| `DELETE` | `/api/expenses/:id` | Yes | Delete an expense |

**Query params for GET:** `category`, `startDate`, `endDate`, `page`, `limit`

### Income

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/income` | Yes | Add a new income record |
| `GET` | `/api/income` | Yes | Get all income (with filters & pagination) |
| `PATCH` | `/api/income/:id` | Yes | Update an income record |
| `DELETE` | `/api/income/:id` | Yes | Delete an income record |

**Query params for GET:** `source`, `startDate`, `endDate`, `page`, `limit`

### Goals

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/goals` | Yes | Create a new goal |
| `GET` | `/api/goals` | Yes | Get all goals (with filters & pagination) |
| `PATCH` | `/api/goals/:id` | Yes | Update a goal |
| `DELETE` | `/api/goals/:id` | Yes | Delete a goal |

**Query params for GET:** `status` (in-progress / completed), `page`, `limit`

> Goal status updates automatically to `completed` when `currentAmount >= targetAmount`

### Budget

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/budget` | Yes | Create a budget for a month |
| `GET` | `/api/budget` | Yes | Get all budgets |
| `GET` | `/api/budget/:month` | Yes | Get budget by month (e.g. 2025-01) |
| `PATCH` | `/api/budget/:id` | Yes | Update a budget |
| `DELETE` | `/api/budget/:id` | Yes | Delete a budget |

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/dashboard/overview` | Yes | Get current month overview + recent transactions |

### Analytics

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/analytics/yearly-trend` | Yes | Income vs expense by month for a year |
| `GET` | `/api/analytics/expense-category` | Yes | Expenses grouped by category |
| `GET` | `/api/analytics/monthly-spending` | Yes | Monthly spending trend |
| `GET` | `/api/analytics/top-categories` | Yes | Top spending categories |
| `GET` | `/api/analytics/biggest-expense` | Yes | Biggest single expense |
| `GET` | `/api/analytics/income-source` | Yes | Income grouped by source |

**Query params:** `year` for yearly-trend, `limit` for top-categories

### Summary

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/summary/monthly` | Yes | Monthly summary with budget vs actual |

**Query params:** `month` (required, e.g. `?month=2025-01`)

### Profile

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/profile` | Yes | Get current user profile |
| `PATCH` | `/api/profile` | Yes | Update name or email |
| `PATCH` | `/api/profile/password` | Yes | Change password |
| `DELETE` | `/api/profile` | Yes | Delete account and all data |

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

### Fail (client error)
```json
{
  "status": "fail",
  "message": "Error message"
}
```

### Validation Error
```json
{
  "status": "fail",
  "errors": [
    { "field": "email", "message": "Valid email is required" }
  ]
}
```

---

## Testing with Postman

1. `POST /api/auth/register` — create an account
2. `POST /api/auth/login` — copy the `accessToken`
3. Add header to all protected requests: `Authorization: Bearer <accessToken>`
4. Use `POST /api/auth/refresh` with `{ "refreshToken": "..." }` to get a new access token

---

## Health Check

```
GET /health
```

Returns `{ "status": "ok" }` if the server is running.
