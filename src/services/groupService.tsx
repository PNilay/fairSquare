import type {
  AddMemberRequest,
  CreateGroupRequest,
  GroupDTO,
  GroupSummaryDTO,
  UserDTO,
} from "../data/types";
import { BASE_URL, handleResponse } from "./apiConfig";

export const groupService = {
  createGroup: async (data: CreateGroupRequest): Promise<GroupDTO> => {
    const res = await fetch(`${BASE_URL}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<GroupDTO>(res);
  },

  getGroups: async (): Promise<GroupDTO[]> => {
    const res = await fetch(`${BASE_URL}/groups`);
    return handleResponse<GroupDTO[]>(res);
  },

  getGroup: async (groupId: number): Promise<GroupDTO> => {
    const res = await fetch(`${BASE_URL}/groups/${groupId}`);
    return handleResponse<GroupDTO>(res);
  },

  updateGroup: async (groupId: number, data: CreateGroupRequest): Promise<GroupDTO> => {
    const res = await fetch(`${BASE_URL}/groups/${groupId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<GroupDTO>(res);
  },

  deleteGroup: async (groupId: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/groups/${groupId}`, { method: "DELETE" });
    return handleResponse<void>(res);
  },

  addMember: async (groupId: number, data: AddMemberRequest): Promise<void> => {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<void>(res);
  },

  getMembers: async (groupId: number): Promise<UserDTO[]> => {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/members`);
    return handleResponse<UserDTO[]>(res);
  },

  removeMember: async (groupId: number, userId: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/members/${userId}`, {
      method: "DELETE",
    });
    return handleResponse<void>(res);
  },

  fetchGroupSummaries: async (userId: number): Promise<GroupSummaryDTO[]> => {
    const response = await fetch(`${BASE_URL}/groups/summaries`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": String(userId),
      },
    });

    return handleResponse<GroupSummaryDTO[]>(response);
  },
};
