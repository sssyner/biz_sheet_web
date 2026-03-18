"use client";

import { InvoiceForm } from "@/components/forms/invoice-form";

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">請求書作成</h2>
      <InvoiceForm />
    </div>
  );
}
