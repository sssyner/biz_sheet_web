"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

function convertTimestamps(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val instanceof Timestamp) {
      result[key] = val.toDate().toISOString();
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      result[key] = convertTimestamps(val as Record<string, unknown>);
    } else {
      result[key] = val;
    }
  }
  return result;
}

export function useFirestoreCollection<T>(collectionName: string) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, `users/${user.uid}/${collectionName}`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...convertTimestamps(doc.data()),
      })) as T[];
      setData(docs);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, collectionName]);

  return { data, loading };
}
