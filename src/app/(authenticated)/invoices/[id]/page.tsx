"use client";

import { use } from "react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { InvoiceForm } from "@/components/forms/invoice-form";
import type { Invoice } from "@/types";

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, loading } = useFirestoreCollection<Invoice>("invoices");
  const invoice = data.find((i) => i.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!invoice) return <p className="text-gray-500 dark:text-gray-400">請求書が見つかりません</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">請求書編集</h2>
      <InvoiceForm invoice={invoice} />
    </div>
  );
}
