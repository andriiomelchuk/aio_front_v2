import type { T_StaffRole } from "@/shared/config/adminRoles";
import type { T_WeeklySchedule } from "@/entities/service";

export type T_EmployeeStatus = "active" | "inactive" | "on_leave" | "terminated";
export type T_Employee = {
  id: string;
  userId?: number;
  providerId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: T_EmployeeStatus;
  roleIds: T_StaffRole[];
  branchIds: string[];
  serviceCategoryIds: string[];
  skills: string[];
  schedule: T_WeeklySchedule[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type T_SaveEmployeeDto = Omit<T_Employee, "id" | "createdAt" | "updatedAt"> & { id?: string };
