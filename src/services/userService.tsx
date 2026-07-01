import type { RelatedUserDTO } from "../data/types";
import { BASE_URL, handleResponse } from "./apiConfig";

export const userService = {
  getFriends: async (userId: number): Promise<RelatedUserDTO[]> => {
    const res = await fetch(`${BASE_URL}/users/${userId}/related`);
    return handleResponse<RelatedUserDTO[]>(res);
  },
};
