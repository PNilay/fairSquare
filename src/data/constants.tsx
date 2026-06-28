import { LayoutDashboard, Users, Receipt, UserPlus, BarChart2 } from "lucide-react";
import type { UserDTO } from "./types";

// Temporary:
export const ME: UserDTO = {
  id: 1,
  name: "Alex Chen",
  email: "alex2@fairshare.io",
  status: "ACTIVE",
  createdAt: "string",
  updatedAt: "string",
};

export const CURRENCIES = [
  { code: "USD", symbol: "$", rate: 1, name: "US Dollar" },
  { code: "EUR", symbol: "€", rate: 0.92, name: "Euro" },
  { code: "GBP", symbol: "£", rate: 0.78, name: "British Pound" },
  { code: "INR", symbol: "₹", rate: 83.12, name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", rate: 149.5, name: "Japanese Yen" },
];

export interface Settlement {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  date: string;
  note: string;
}

// Data:
export const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-rose-500",
];

export type View =
  | "dashboard"
  | "groups"
  | "group-detail"
  | "expenses"
  | "friends"
  | "friend-detail"
  | "analytics";

export const NAV_ITEMS = [
  { id: "dashboard" as View, label: "Dashboard", Icon: LayoutDashboard },
  { id: "groups" as View, label: "Groups", Icon: Users },
  { id: "expenses" as View, label: "Expenses", Icon: Receipt },
  { id: "friends" as View, label: "Friends", Icon: UserPlus },
  { id: "analytics" as View, label: "Analytics", Icon: BarChart2 },
];
