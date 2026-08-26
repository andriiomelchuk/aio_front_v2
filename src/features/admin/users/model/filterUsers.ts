import type { T_User, T_UserStatus } from "@/entities/user";

export const filterUsers = (users: T_User[], params: {status: T_UserStatus | "all"; search: string}): T_User[] => {

    const normalizedSearch = params.search.trim();
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
          normalizedSearch === "" ||
          user.name.toLowerCase().includes(normalizedSearch.toLowerCase());
    
        const matchesStatus = params.status === "all" || user.status === params.status;
    
        return matchesSearch && matchesStatus;
      });

      return filteredUsers;
}
