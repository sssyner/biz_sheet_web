"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, TrendingUp, Receipt, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { formatYen, formatDate } from "@/lib/format";
import type { Customer, Sale, Expense, Invoice } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  negotiating: "商談中",
  inProgress: "進行中",
  completed: "完了",
  paid: "入金済み",
};

export default function DashboardPage() {
  const { data: customers } = useFirestoreCollection<Customer>("customers");
  const { data: sales, loading } = useFirestoreCollection<Sale>("sales");
  const { data: expenses } = useFirestoreCollection<Expense>("expenses");
  const { data: invoices } = useFirestoreCollection<Invoice>("invoices");

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const thisMonthSales = useMemo(
    () =>
      sales
        .filter((s) => {
          const d = new Date(s.startDate);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        })
        .reduce((sum, s) => sum + s.amount, 0),
    [sales, thisMonth, thisYear]
  );

  const thisMonthExpenses = useMemo(
    () =>
      expenses
        .filter((e) => {
          const d = new Date(e.date);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        })
        .reduce((sum, e) => sum + e.amount, 0),
    [expenses, thisMonth, thisYear]
  );

  const unpaidInvoices = useMemo(
    () => invoices.filter((i) => i.status !== "paid"),
    [invoices]
  );

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach((s) => {
      const d = new Date(s.startDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + s.amount;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, amount]) => ({ month, amount }));
  }, [sales]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">今月の売上</p>
              <p className="text-xl font-bold">{formatYen(thisMonthSales)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Receipt className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">今月の経費</p>
              <p className="text-xl font-bold">{formatYen(thisMonthExpenses)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">未入金</p>
              <p className="text-xl font-bold">
                {unpaidInvoices.length}件 /{" "}
                {formatYen(unpaidInvoices.reduce((s, i) => s + i.amount, 0))}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">顧客数</p>
              <p className="text-xl font-bold">{customers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>月別売上</CardTitle>
        </CardHeader>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`} />
              <Tooltip
                formatter={(value) => [formatYen(value as number), "売上"]}
              />
              <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-12">データがありません</p>
        )}
      </Card>

      {/* Recent Sales & Unpaid Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>最近の売上</CardTitle>
          </CardHeader>
          {sales.length > 0 ? (
            <div className="space-y-3">
              {sales
                .sort(
                  (a, b) =>
                    new Date(b.startDate).getTime() -
                    new Date(a.startDate).getTime()
                )
                .slice(0, 5)
                .map((s) => (
                  <Link
                    key={s.id}
                    href={`/sales/${s.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{s.projectName}</p>
                      <p className="text-xs text-gray-500">{s.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {formatYen(s.amount)}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {STATUS_LABELS[s.status] || s.status}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">データがありません</p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>未入金の請求書</CardTitle>
          </CardHeader>
          {unpaidInvoices.length > 0 ? (
            <div className="space-y-3">
              {unpaidInvoices.slice(0, 5).map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{inv.customerName}</p>
                    <p className="text-xs text-gray-500">
                      期限: {formatDate(inv.dueDate)}
                    </p>
                  </div>
                  <p className="font-medium text-sm">
                    {formatYen(inv.amount)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              未入金の請求書はありません
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
