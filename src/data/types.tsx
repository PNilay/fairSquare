export type BalanceStatus = "OWES" | "OWED" | "SETTLED";

export interface CurrentUserBalance {
  amount: number;
  status: BalanceStatus;
}

export interface GroupMember {
  id: number;
  name: string;
  avatar: string;
  netBalance: number;
  createdAt: string;
  updatedAt: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface SimplifiedDebt {
  fromUserId: number;
  toUserId: number;
  amount: number;
}

export interface GroupSummaryDTO {
  id: number;
  name: string;
  description: string;
  icon: string;
  status: GroupStatus;
  createdAt: string; // ISO Date String
  createdBy: number;
  expenseCount: number;
  currentUserBalance: CurrentUserBalance;
  members: GroupMember[];
  simplifiedDebts: SimplifiedDebt[];
}

export interface GroupDTO {
  id: number;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  status: GroupStatus;
  icon: string;
}

export interface ExpenseSplit {
  userId: number;
  amount: number;
  percentage: number;
  share: number;
}

export interface ExpenseDTO {
  id: number;
  groupId: number;
  paidBy: number;
  amount: number;
  description: string;
  category: ExpenseCategory;
  currency: string;
  notes: string;
  expenseDate: string;
  splitType: SplitStrategy;
  splits: ExpenseSplit[];
}

export interface PopulatedGroup extends GroupDTO {
  members: UserDTO[];
  expenses: ExpenseDTO[];
  balance: number;
}

export interface UserBalanceSummaryDTO {
  totalOwedToYou: number;
  totalYouOwe: number;
  netBalance: number;
}

export interface RelatedUserDTO {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  relationshipContext: RelationshipContext;
}

export interface ExpensePageDTO {
  content: ExpenseDTO[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface ExpenseListDTO {
  content: ExpenseDTO[];
  hasMoreOlder: boolean;
  hasMoreNewer: boolean;
  startCursor: number;
  endCursor: number;
}

export type RelationshipContext = "GROUP" | "INDIVIDUAL" | "BOTH";

export interface GroupInfo {
  id: number;
  name: string;
  icon: string;
  members: UserDTO[];
}

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

export type SplitStrategy = "EQUAL" | "EXACT" | "PERCENTAGE" | "SHARE";

export interface Split {
  userId: string;
  amount?: number;
  percentage?: number;
}

export type ExpenseCategory =
  | "FOOD"
  | "TRAVEL"
  | "RENT"
  | "UTILITIES"
  | "SHOPPING"
  | "OTHER"
  | string;

export const CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: "FOOD", label: "Food & Drink", icon: "🍔" },
  { value: "GROCERIES", label: "Groceries", icon: "🛒" },
  { value: "TRANSPORTATION", label: "Transportation", icon: "🚗" },
  { value: "ENTERTAINMENT", label: "Entertainment", icon: "🎬" },
  { value: "RENT", label: "Rent", icon: "🏠" },
  { value: "UTILITIES", label: "Utilities", icon: "💡" },
  { value: "SHOPPING", label: "Shopping", icon: "🛍️" },
  { value: "TRAVEL", label: "Travel", icon: "✈️" },
  { value: "MEDICAL", label: "Medical", icon: "🏥" },
  { value: "OTHERS", label: "Others", icon: "📦" },
];

export type GroupStatus = "ACTIVE" | "ARCHIVED";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface AddMemberRequest {
  userId: number;
}

export interface ApiErrorResponse {
  message?: string;
}
