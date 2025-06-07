"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { formatYen, formatDate } from "@/lib/format";
import type { Expense } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  transportation: "交通費",
  supplies: "消耗品",
  entertainment: "接待費",
  communication: "通信費",
  rent: "家賃",
  utilities: "光熱費",
  other: "その他",
};

export default function ExpensesPage() {
  const { data, loading } = useFirestoreCollection<Expense>("expenses");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">経費一覧</h2>
        <Link href="/expenses/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            追加
          </Button>
        </Link>
      </div>
      <Card>
        <DataTable
          data={data}
          loading={loading}
          linkPrefix="/expenses"
          getId={(e) => e.id}
          columns={[
            { key: "date", header: "日付", render: (e) => formatDate(e.date) },
            { key: "amount", header: "金額", render: (e) => formatYen(e.amount) },
            {
              key: "category",
              header: "カテゴリ",
              render: (e) => CATEGORY_LABELS[e.category] || e.category,
            },
            { key: "storeName", header: "店名" },
          ]}
        />
      </Card>
    </div>
  );
}
