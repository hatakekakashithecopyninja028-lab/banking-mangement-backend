import React from "react";
import { 
  useGetDashboardSummary, getGetDashboardSummaryQueryKey,
  useGetMonthlySummary, getGetMonthlySummaryQueryKey,
  useGetCategoryTotals, getGetCategoryTotalsQueryKey,
  useGetRecentTransactions, getGetRecentTransactionsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea', '#4f46e5', '#0891b2', '#0d9488'];

function SummaryCards() {
  const { data: summary, isLoading } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() }
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[120px] w-full" />)}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary?.netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary?.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary?.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary?.totalRecords || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function MonthlyChart() {
  const { data: monthlyData, isLoading } = useGetMonthlySummary({
    query: { queryKey: getGetMonthlySummaryQueryKey() }
  });

  if (isLoading) return <Skeleton className="h-[400px] w-full" />;

  const data = [...(monthlyData || [])].reverse();

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Cash Flow</CardTitle>
        <CardDescription>Monthly income and expenses over the last year.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
              />
              <RechartsTooltip 
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="income" name="Income" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryChart() {
  const { data: categories, isLoading } = useGetCategoryTotals({
    query: { queryKey: getGetCategoryTotalsQueryKey() }
  });

  if (isLoading) return <Skeleton className="h-[400px] w-full" />;

  const expenses = categories?.filter(c => c.type === 'expense') || [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>Breakdown of where your money goes.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4 flex items-center justify-center">
          {expenses.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenses}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="total"
                  nameKey="category"
                  stroke="none"
                >
                  {expenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Total']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-muted-foreground flex items-center justify-center h-full">No expense data available</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentTransactions() {
  const { data: records, isLoading } = useGetRecentTransactions({
    query: { queryKey: getGetRecentTransactionsQueryKey() }
  });

  if (isLoading) return <Skeleton className="h-[400px] w-full" />;

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records && records.length > 0 ? (
            records.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full flex items-center justify-center ${record.type === 'income' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                    {record.type === 'income' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base capitalize">{record.category}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(record.date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${record.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                    {record.type === 'income' ? '+' : '-'}${record.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {record.notes && <p className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">{record.notes}</p>}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">No recent transactions found.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Financial overview and key performance indicators.</p>
      </div>

      <SummaryCards />

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <MonthlyChart />
        <CategoryChart />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <RecentTransactions />
      </div>
    </div>
  );
}
