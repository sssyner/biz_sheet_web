"use client";

import { ContractForm } from "@/components/forms/contract-form";

export default function NewContractPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">契約追加</h2>
      <ContractForm />
    </div>
  );
}
