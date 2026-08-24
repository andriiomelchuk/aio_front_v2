import type { T_CreateUserDto, T_UpdateUserDto } from "@/entities/user";



export const createUser = async (user: T_CreateUserDto) => {
  console.log("Create user request:", user);

  return {
    id: Date.now(),
    ...user,
  };
};

export const updateUser = async (user: T_UpdateUserDto) => {
  console.log("Update user request:", user);

  return user;
};
