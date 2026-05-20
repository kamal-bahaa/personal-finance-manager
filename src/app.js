const express = require("express");
const cors = require("cors");

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const authRoutes = require("./modules/auth/auth.routes");
const expenseRoutes = require("./modules/expense/expense.routes");
const incomeRoutes = require("./modules/income/income.routes");
const goalRoutes = require("./modules/goal/goal.routes");
const budgetRoutes = require("./modules/budget/budget.routes");

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:4200",
    credentials: true,
}));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/budget", budgetRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;