"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { formatYen, formatDate } from "@/lib/format";
import type { Contract } from "@/types";

export default function ContractsPage() {
  const { data, loading } = useFirestoreCollection<Contract>("contracts");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">契約一覧</h2>
        <Link href="/contracts/new">
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
          linkPrefix="/contracts"
          getId={(c) => c.id}
          columns={[
            { key: "contractName", header: "契約名" },
            { key: "customerName", header: "顧客" },
            { key: "amount", header: "金額", render: (c) => formatYen(c.amount) },
            { key: "startDate", header: "開始日", render: (c) => formatDate(c.startDate) },
            { key: "endDate", header: "終了日", render: (c) => formatDate(c.endDate) },
          ]}
        />
      </Card>
    </div>
  );
}
