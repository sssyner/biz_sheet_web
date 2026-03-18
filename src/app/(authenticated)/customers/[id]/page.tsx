"use client";

import { use } from "react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { CustomerForm } from "@/components/forms/customer-form";
import type { Customer } from "@/types";

export default function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, loading } = useFirestoreCollection<Customer>("customers");
  const customer = data.find((c) => c.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!customer) {
    return <p className="text-gray-500">顧客が見つかりません</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">顧客編集</h2>
      <CustomerForm customer={customer} />
    </div>
  );
}
