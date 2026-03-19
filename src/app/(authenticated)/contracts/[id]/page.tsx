"use client";

import { use } from "react";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { ContractForm } from "@/components/forms/contract-form";
import type { Contract } from "@/types";

export default function EditContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, loading } = useFirestoreCollection<Contract>("contracts");
  const contract = data.find((c) => c.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!contract) return <p className="text-gray-500 dark:text-gray-400">契約が見つかりません</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">契約編集</h2>
      <ContractForm contract={contract} />
    </div>
  );
}
