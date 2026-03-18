export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  memo: string;
  spreadsheetUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export type SaleStatus = "negotiating" | "inProgress" | "completed" | "paid";

export interface Sale {
  id: string;
  customerId: string;
  projectName: string;
  amount: number;
  status: SaleStatus;
  startDate: string;
  completionDate?: string;
  customerName: string;
}

export type ExpenseCategory =
  | "transportation"
  | "supplies"
  | "entertainment"
  | "communication"
  | "rent"
  | "utilities"
  | "other";

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  storeName: string;
  memo: string;
  receiptImageUrl?: string;
}

export interface Contract {
  id: string;
  customerId: string;
  contractName: string;
  amount: number;
  startDate: string;
  endDate?: string;
  customerName: string;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  pdfUrl?: string;
  customerName: string;
  items: InvoiceItem[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface DashboardData {
  thisMonthSales: number;
  thisMonthExpenses: number;
  unpaidCount: number;
  unpaidTotal: number;
  totalCustomers: number;
  totalSales: number;
  monthlySales: Record<string, number>;
  salesByStatus: Record<string, number>;
  recentSales: Sale[];
  unpaidInvoices: Invoice[];
}
