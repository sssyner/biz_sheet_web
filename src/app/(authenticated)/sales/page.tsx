"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { formatYen } from "@/lib/format";
import type { Sale } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  negotiating: "商談中",
  inProgress: "進行中",
  completed: "完了",
  paid: "入金済み",
};

const STATUS_COLORS: Record<string, string> = {
  negotiating: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  inProgress: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  paid: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

export default function SalesPage() {
  const { data, loading } = useFirestoreCollection<Sale>("sales");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">売上一覧</h2>
        <Link href="/sales/new">
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
          linkPrefix="/sales"
          getId={(s) => s.id}
          columns={[
            { key: "projectName", header: "案件名" },
            { key: "customerName", header: "顧客" },
            {
              key: "amount",
              header: "金額",
              render: (s) => formatYen(s.amount),
            },
            {
              key: "status",
              header: "ステータス",
              render: (s) => (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[s.status] || ""}`}
                >
                  {STATUS_LABELS[s.status] || s.status}
                </span>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
