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
import { Card } from "@/components/ui/card";
import type { Customer } from "@/types";

const schema = z.object({
  companyName: z.string().min(1, "会社名は必須です"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  memo: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function CustomerForm({ customer }: { customer?: Customer }) {
  const router = useRouter();
  const { user } = useAuth();
  const isEdit = !!customer;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: customer
      ? {
          companyName: customer.companyName,
          contactPerson: customer.contactPerson,
          phone: customer.phone,
          email: customer.email,
          memo: customer.memo,
        }
      : {},
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    const id = customer?.id || uuid();
    const ref = doc(db, `users/${user.uid}/customers`, id);
    await setDoc(
      ref,
      {
        ...data,
        id,
        contactPerson: data.contactPerson || "",
        phone: data.phone || "",
        email: data.email || "",
        memo: data.memo || "",
        createdAt: customer ? Timestamp.fromDate(new Date(customer.createdAt)) : Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
    router.push("/customers");
  };

  const handleDelete = async () => {
    if (!user || !customer) return;
    if (!confirm("この顧客を削除しますか？")) return;
    await deleteDoc(doc(db, `users/${user.uid}/customers`, customer.id));
    router.push("/customers");
  };

  return (
    <Card className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="会社名 *"
          {...register("companyName")}
          error={errors.companyName?.message}
        />
        <Input label="担当者" {...register("contactPerson")} />
        <Input label="電話" {...register("phone")} />
        <Input label="メール" type="email" {...register("email")} />
        <Input label="メモ" {...register("memo")} />

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isEdit ? "更新" : "作成"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
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
