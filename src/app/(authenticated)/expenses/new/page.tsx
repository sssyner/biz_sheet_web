"use client";

import { ExpenseForm } from "@/components/forms/expense-form";

export default function NewExpensePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">経費追加</h2>
      <ExpenseForm />
    </div>
  );
}
