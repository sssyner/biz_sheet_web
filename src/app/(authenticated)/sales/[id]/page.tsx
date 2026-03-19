"use client";

import { use } from "react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { SaleForm } from "@/components/forms/sale-form";
import type { Sale } from "@/types";

export default function EditSalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, loading } = useFirestoreCollection<Sale>("sales");
  const sale = data.find((s) => s.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!sale) return <p className="text-gray-500 dark:text-gray-400">売上が見つかりません</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">売上編集</h2>
      <SaleForm sale={sale} />
    </div>
  );
}
