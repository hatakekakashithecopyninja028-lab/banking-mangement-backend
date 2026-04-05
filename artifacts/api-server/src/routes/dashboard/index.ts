import { Router, type IRouter } from "express";
import { Record } from "../../models/Record.js";
import { authenticate, type AuthRequest } from "../../middlewares/auth.js";

const router: IRouter = Router();

router.get("/dashboard/summary", authenticate, async (_req: AuthRequest, res): Promise<void> => {
  const [incomeResult, expenseResult, totalRecords] = await Promise.all([
    Record.aggregate([
      { $match: { type: "income", isDeleted: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Record.aggregate([
      { $match: { type: "expense", isDeleted: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Record.countDocuments({ isDeleted: false }),
  ]);

  const totalIncome = incomeResult[0]?.total ?? 0;
  const totalExpenses = expenseResult[0]?.total ?? 0;
  const netBalance = totalIncome - totalExpenses;

  res.json({ totalIncome, totalExpenses, netBalance, totalRecords });
});

router.get("/dashboard/category-totals", authenticate, async (_req: AuthRequest, res): Promise<void> => {
  const results = await Record.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const formatted = results.map((r) => ({
    category: r._id.category,
    type: r._id.type,
    total: r.total,
    count: r.count,
  }));

  res.json(formatted);
});

router.get("/dashboard/monthly-summary", authenticate, async (_req: AuthRequest, res): Promise<void> => {
  const results = await Record.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthMap: Record<string, { month: string; year: number; income: number; expenses: number; net: number }> = {};
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (const r of results) {
    const key = `${r._id.year}-${r._id.month}`;
    if (!monthMap[key]) {
      monthMap[key] = { month: MONTHS[r._id.month - 1], year: r._id.year, income: 0, expenses: 0, net: 0 };
    }
    if (r._id.type === "income") monthMap[key].income += r.total;
    else monthMap[key].expenses += r.total;
  }

  const formatted = Object.values(monthMap).map((m) => ({
    ...m,
    net: m.income - m.expenses,
  }));

  res.json(formatted);
});

router.get("/dashboard/recent-transactions", authenticate, async (_req: AuthRequest, res): Promise<void> => {
  const records = await Record.find({ isDeleted: false }).sort({ date: -1 }).limit(5);

  const formatted = records.map((r) => ({
    id: r.id,
    amount: r.amount,
    type: r.type,
    category: r.category,
    date: r.date.toISOString(),
    notes: r.notes ?? null,
    createdBy: r.createdBy.toString(),
    isDeleted: r.isDeleted,
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(formatted);
});

export default router;
