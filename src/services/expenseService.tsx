import type {
  CreateExpenseRequest,
  ExpenseDTO,
  ExpenseListDTO,
  ExpensePageDTO,
  UserBalanceSummaryDTO,
} from "../data/types";
import { BASE_URL, handleResponse } from "./apiConfig";

export const expenseService = {
  getGlobalBalanceSummary: async (userId: number): Promise<UserBalanceSummaryDTO> => {
    const res = await fetch(`${BASE_URL}/users/${userId}/balance-summary`);
    return handleResponse<UserBalanceSummaryDTO>(res);
  },

  getExpenses: async (): Promise<ExpenseDTO[]> => {
    const res = await fetch(`${BASE_URL}/expenses`);
    return handleResponse<ExpenseDTO[]>(res);
  },

  getExpense: async (expenseId: number): Promise<ExpenseDTO> => {
    const res = await fetch(`${BASE_URL}/expenses/${expenseId}`);
    return handleResponse<ExpenseDTO>(res);
  },

  createExpense: async (expense: CreateExpenseRequest): Promise<ExpenseDTO> => {
    const res = await fetch(`${BASE_URL}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expense),
    });
    return handleResponse<ExpenseDTO>(res);
  },

  deleteExpense: async (expenseId: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/expenses/${expenseId}`, { method: "DELETE" });
    return handleResponse<void>(res);
  },

  getGroupExpenses: async (groupId: number): Promise<ExpenseDTO[]> => {
    const res = await fetch(`${BASE_URL}/expenses/group/${groupId}`);
    return handleResponse<ExpenseDTO[]>(res);
  },

  getExpensesForUser: async (
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<ExpensePageDTO> => {
    const res = await fetch(`${BASE_URL}/expenses/user/${userId}?page=${page}&limit=${limit}`);
    return handleResponse<ExpensePageDTO>(res);
  },

  getExpensesForGroup: async (
    userId: number,
    groupId: number,
    beforeId: number | null = null,
    afterId: number | null = null,
    limit: number = 20,
  ): Promise<ExpenseListDTO> => {
    const queryParams = new URLSearchParams();
    queryParams.append("limit", limit.toString());

    if (beforeId !== null) {
      queryParams.append("before_id", beforeId.toString());
    }
    if (afterId !== null) {
      queryParams.append("after_id", afterId.toString());
    }

    const url = `${BASE_URL}/groups/${groupId}/expenses?${queryParams.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse<ExpenseListDTO>(res);
  },
};
