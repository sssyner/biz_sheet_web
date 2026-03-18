"use client";

import { SaleForm } from "@/components/forms/sale-form";

export default function NewSalePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">売上追加</h2>
      <SaleForm />
    </div>
  );
}
