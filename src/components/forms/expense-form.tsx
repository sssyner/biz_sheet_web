"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, setDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import type { Expense } from "@/types";

const schema = z.object({
  date: z.string().min(1, "日付は必須です"),
  amount: z.number().min(0),
  category: z.enum([
    "transportation",
    "supplies",
    "entertainment",
    "communication",
    "rent",
    "utilities",
    "other",
  ]),
  storeName: z.string().optional(),
  memo: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ExpenseForm({ expense }: { expense?: Expense }) {
  const router = useRouter();
  const { user } = useAuth();
  const isEdit = !!expense;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: expense
      ? {
          date: expense.date?.split("T")[0],
          amount: expense.amount,
          category: expense.category,
          storeName: expense.storeName,
          memo: expense.memo,
        }
      : { category: "other", date: new Date().toISOString().split("T")[0] },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    const id = expense?.id || uuid();
    const ref = doc(db, `users/${user.uid}/expenses`, id);
    await setDoc(ref, {
      id,
      date: Timestamp.fromDate(new Date(data.date)),
      amount: Number(data.amount),
      category: data.category,
      storeName: data.storeName || "",
      memo: data.memo || "",
      receiptImageUrl: expense?.receiptImageUrl || null,
    }, { merge: true });
    router.push("/expenses");
  };

  const handleDelete = async () => {
    if (!user || !expense) return;
    if (!confirm("この経費を削除しますか？")) return;
    await deleteDoc(doc(db, `users/${user.uid}/expenses`, expense.id));
    router.push("/expenses");
  };

  return (
    <Card className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="日付 *"
          type="date"
          {...register("date")}
          error={errors.date?.message}
        />
        <Input
          label="金額 *"
          type="number"
          {...register("amount", { valueAsNumber: true })}
          error={errors.amount?.message}
        />
        <Select
          label="カテゴリ"
          {...register("category")}
          options={[
            { value: "transportation", label: "交通費" },
            { value: "supplies", label: "消耗品" },
            { value: "entertainment", label: "接待費" },
            { value: "communication", label: "通信費" },
            { value: "rent", label: "家賃" },
            { value: "utilities", label: "光熱費" },
            { value: "other", label: "その他" },
          ]}
        />
        <Input label="店名" {...register("storeName")} />
        <Input label="メモ" {...register("memo")} />

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isEdit ? "更新" : "作成"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            キャンセル
          </Button>
          {isEdit && (
            <Button type="button" variant="danger" onClick={handleDelete}>
              削除
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
