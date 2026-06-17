import { LayoutDashboard, Users, Receipt, UserPlus, BarChart2 } from "lucide-react";

// Temporary:
export const ME: User = {
  id: "u1",
  name: "Alex Chen",
  initials: "AC",
  colorIdx: 0,
  uemail: "alex2@fairshare.io",
};
export const USERS: User[] = [
  ME,
  { id: "u2", name: "Jordan Lee", initials: "JL", colorIdx: 1, uemail: "jordan@fairshare.io" },
  { id: "u3", name: "Sam Rivera", initials: "SR", colorIdx: 2, uemail: "jordan@fairshare.io" },
  { id: "u4", name: "Morgan Kim", initials: "MK", colorIdx: 3, uemail: "jordan@fairshare.io" },
  { id: "u5", name: "Taylor Pham", initials: "TP", colorIdx: 4, uemail: "jordan@fairshare.io" },
];

export const GROUPS: Group[] = [
  { id: "g1", name: "NYC Apartment", memberIds: ["u1", "u2", "u3", "u4"], emoji: "🏠" },
  { id: "g2", name: "Tokyo Trip 2026", memberIds: ["u1", "u2", "u5"], emoji: "✈️" },
  { id: "g3", name: "Office Lunch", memberIds: ["u1", "u3", "u4", "u5"], emoji: "🍱" },
];

export const CURRENCIES = [
  { code: "USD", symbol: "$", rate: 1, name: "US Dollar" },
  { code: "EUR", symbol: "€", rate: 0.92, name: "Euro" },
  { code: "GBP", symbol: "£", rate: 0.78, name: "British Pound" },
  { code: "INR", symbol: "₹", rate: 83.12, name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", rate: 149.5, name: "Japanese Yen" },
];
// Interfaces:
export interface User {
  id: string;
  name: string;
  initials: string;
  colorIdx: number;
  uemail: string;
}

export interface Group {
  id: string;
  name: string;
  memberIds: string[];
  emoji: string;
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
