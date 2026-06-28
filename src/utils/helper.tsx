import { type ExpenseDTO, type ExpenseCategory, CATEGORIES } from "../data/types";

export const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function makeFmt(cur: { code: string; rate: number }) {
  return (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cur.code,
      minimumFractionDigits: cur.code === "JPY" ? 0 : 2,
      maximumFractionDigits: cur.code === "JPY" ? 0 : 2,
    }).format(n * cur.rate);
}

export function getInitials(name: string): string {
  if (!name) return "??";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  const firstInitial = parts[0][0];
  const lastInitial = parts[parts.length - 1][0];

  return (firstInitial + lastInitial).toUpperCase();
}

export function getColorIndex(userID: number, maxColors: number = 8): number {
  let hash = 0;
  for (let i = 0; i < userID.toString().length; i++) {
    hash = userID.toString().charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % maxColors;
}

export function exportCSV(label: string, expenses: ExpenseDTO[]) {
  const H = [
    "Date",
    "Description",
    "Category",
    "Amount (USD)",
    "Paid By",
    "Context",
    "Split Strategy",
    "Your Balance (USD)",
  ];
  const rows = expenses.map((e) => [
    e.expenseDate,
    e.description,
    e.category,
    e.amount.toFixed(2),
    "PaidBy",
    // getUser(e.paidById)?.name ?? "",
    e.groupId ? "GROUP NAME" : "Direct Friend",
    e.splitType,
    "UserBalance",
  ]);
  const csv = [H, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `fairshare-${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const getCatIcon = (category: ExpenseCategory) =>
  CATEGORIES.find((x) => x.value === category)?.icon ?? "📦";
