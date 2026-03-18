"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { formatYen, formatDate } from "@/lib/format";
import type { Invoice } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  draft: "下書き",
  sent: "送付済み",
  paid: "入金済み",
  overdue: "期限超過",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-50 text-blue-700",
  paid: "bg-green-50 text-green-700",
  overdue: "bg-red-50 text-red-700",
};

export default function InvoicesPage() {
  const { data, loading } = useFirestoreCollection<Invoice>("invoices");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">請求書一覧</h2>
        <Link href="/invoices/new">
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
          linkPrefix="/invoices"
          getId={(i) => i.id}
          columns={[
            { key: "customerName", header: "顧客" },
            { key: "amount", header: "金額", render: (i) => formatYen(i.amount) },
            {
              key: "issueDate",
              header: "発行日",
              render: (i) => formatDate(i.issueDate),
            },
            {
              key: "dueDate",
              header: "支払期限",
              render: (i) => formatDate(i.dueDate),
            },
            {
              key: "status",
              header: "ステータス",
              render: (i) => (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[i.status] || ""}`}
                >
                  {STATUS_LABELS[i.status] || i.status}
                </span>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
