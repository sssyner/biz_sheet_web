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
import type { Contract, Customer } from "@/types";

const schema = z.object({
  customerId: z.string().min(1, "顧客を選択してください"),
  contractName: z.string().min(1, "契約名は必須です"),
  amount: z.number().min(0),
  startDate: z.string().min(1, "開始日は必須です"),
  endDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ContractForm({ contract }: { contract?: Contract }) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: customers } = useFirestoreCollection<Customer>("customers");
  const isEdit = !!contract;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: contract
      ? {
          customerId: contract.customerId,
          contractName: contract.contractName,
          amount: contract.amount,
          startDate: contract.startDate?.split("T")[0],
          endDate: contract.endDate?.split("T")[0],
        }
      : { startDate: new Date().toISOString().split("T")[0] },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    const id = contract?.id || uuid();
    const customer = customers.find((c) => c.id === data.customerId);
    const ref = doc(db, `users/${user.uid}/contracts`, id);
    await setDoc(ref, {
      id,
      customerId: data.customerId,
      contractName: data.contractName,
      amount: Number(data.amount),
      customerName: customer?.companyName || "",
      startDate: Timestamp.fromDate(new Date(data.startDate)),
      endDate: data.endDate ? Timestamp.fromDate(new Date(data.endDate)) : null,
    }, { merge: true });
    router.push("/contracts");
  };

  const handleDelete = async () => {
    if (!user || !contract) return;
    if (!confirm("この契約を削除しますか？")) return;
    await deleteDoc(doc(db, `users/${user.uid}/contracts`, contract.id));
    router.push("/contracts");
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
          label="契約名 *"
          {...register("contractName")}
          error={errors.contractName?.message}
        />
        <Input label="金額" type="number" {...register("amount", { valueAsNumber: true })} />
        <Input label="開始日 *" type="date" {...register("startDate")} />
        <Input label="終了日" type="date" {...register("endDate")} />

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
