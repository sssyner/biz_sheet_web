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
import type { Invoice, Customer } from "@/types";

const schema = z.object({
  customerId: z.string().min(1, "顧客を選択してください"),
  amount: z.number().min(0),
  issueDate: z.string().min(1, "発行日は必須です"),
  dueDate: z.string().min(1, "支払期限は必須です"),
  status: z.enum(["draft", "sent", "paid", "overdue"]),
});

type FormData = z.infer<typeof schema>;

export function InvoiceForm({ invoice }: { invoice?: Invoice }) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: customers } = useFirestoreCollection<Customer>("customers");
  const isEdit = !!invoice;

  const today = new Date().toISOString().split("T")[0];
  const nextMonth = new Date(Date.now() + 30 * 86400000)
    .toISOString()
    .split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: invoice
      ? {
          customerId: invoice.customerId,
          amount: invoice.amount,
          issueDate: invoice.issueDate?.split("T")[0],
          dueDate: invoice.dueDate?.split("T")[0],
          status: invoice.status,
        }
      : { status: "draft", issueDate: today, dueDate: nextMonth },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    const id = invoice?.id || uuid();
    const customer = customers.find((c) => c.id === data.customerId);
    const ref = doc(db, `users/${user.uid}/invoices`, id);
    await setDoc(ref, {
      id,
      customerId: data.customerId,
      amount: Number(data.amount),
      issueDate: Timestamp.fromDate(new Date(data.issueDate)),
      dueDate: Timestamp.fromDate(new Date(data.dueDate)),
      status: data.status,
      customerName: customer?.companyName || "",
      pdfUrl: invoice?.pdfUrl || null,
      items: invoice?.items || [],
    }, { merge: true });
    router.push("/invoices");
  };

  const handleDelete = async () => {
    if (!user || !invoice) return;
    if (!confirm("この請求書を削除しますか？")) return;
    await deleteDoc(doc(db, `users/${user.uid}/invoices`, invoice.id));
    router.push("/invoices");
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
          label="金額 *"
          type="number"
          {...register("amount", { valueAsNumber: true })}
          error={errors.amount?.message}
        />
        <Input label="発行日 *" type="date" {...register("issueDate")} />
        <Input label="支払期限 *" type="date" {...register("dueDate")} />
        <Select
          label="ステータス"
          {...register("status")}
          options={[
            { value: "draft", label: "下書き" },
            { value: "sent", label: "送付済み" },
            { value: "paid", label: "入金済み" },
            { value: "overdue", label: "期限超過" },
          ]}
        />

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
