"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, setDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import type { Sale, Customer } from "@/types";

const schema = z.object({
  customerId: z.string().min(1, "顧客を選択してください"),
  projectName: z.string().min(1, "案件名は必須です"),
  amount: z.number().min(0),
  status: z.enum(["negotiating", "inProgress", "completed", "paid"]),
  startDate: z.string().min(1, "開始日は必須です"),
  completionDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function SaleForm({ sale }: { sale?: Sale }) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: customers } = useFirestoreCollection<Customer>("customers");
  const isEdit = !!sale;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: sale
      ? {
          customerId: sale.customerId,
          projectName: sale.projectName,
          amount: sale.amount,
          status: sale.status,
          startDate: sale.startDate?.split("T")[0],
          completionDate: sale.completionDate?.split("T")[0],
        }
      : { status: "negotiating", startDate: new Date().toISOString().split("T")[0] },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    const id = sale?.id || uuid();
    const customer = customers.find((c) => c.id === data.customerId);
    const ref = doc(db, `users/${user.uid}/sales`, id);
    await setDoc(ref, {
      ...data,
      id,
      amount: Number(data.amount),
      customerName: customer?.companyName || "",
      startDate: Timestamp.fromDate(new Date(data.startDate)),
      completionDate: data.completionDate
        ? Timestamp.fromDate(new Date(data.completionDate))
        : null,
    }, { merge: true });
    router.push("/sales");
  };

  const handleDelete = async () => {
    if (!user || !sale) return;
    if (!confirm("この売上を削除しますか？")) return;
    await deleteDoc(doc(db, `users/${user.uid}/sales`, sale.id));
    router.push("/sales");
  };

  return (
    <Card className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="顧客 *"
          {...register("customerId")}
          error={errors.customerId?.message}
          options={[
            { value: "", label: "選択してください" },
            ...customers.map((c) => ({ value: c.id, label: c.companyName })),
          ]}
        />
        <Input
          label="案件名 *"
          {...register("projectName")}
          error={errors.projectName?.message}
        />
        <Input
          label="金額"
          type="number"
          {...register("amount", { valueAsNumber: true })}
          error={errors.amount?.message}
        />
        <Select
          label="ステータス"
          {...register("status")}
          options={[
            { value: "negotiating", label: "商談中" },
            { value: "inProgress", label: "進行中" },
            { value: "completed", label: "完了" },
            { value: "paid", label: "入金済み" },
          ]}
        />
        <Input label="開始日 *" type="date" {...register("startDate")} />
        <Input label="完了日" type="date" {...register("completionDate")} />

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
