"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  linkPrefix: string;
  getId: (item: T) => string;
  loading?: boolean;
  emptyText?: string;
}

export function DataTable<T>({
  data,
  columns,
  linkPrefix,
  getId,
  loading,
  emptyText = "データがありません",
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return <p className="text-gray-400 text-center py-12">{emptyText}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={getId(item)}
              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4 dark:text-gray-300">
                  <Link href={`${linkPrefix}/${getId(item)}`} className="block">
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? "")}
                  </Link>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
