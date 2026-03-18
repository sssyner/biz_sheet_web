"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import type { Customer } from "@/types";

export default function CustomersPage() {
  const { data, loading } = useFirestoreCollection<Customer>("customers");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">顧客一覧</h2>
        <Link href="/customers/new">
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
          linkPrefix="/customers"
          getId={(c) => c.id}
          columns={[
            { key: "companyName", header: "会社名" },
            { key: "contactPerson", header: "担当者" },
            { key: "phone", header: "電話" },
            { key: "email", header: "メール" },
          ]}
        />
      </Card>
    </div>
  );
}
