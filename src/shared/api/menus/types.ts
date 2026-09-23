import { ApiError } from "@/shared/api/core";
import type {
  T_CreateMenuDto,
  T_Menu,
  T_MenuAssignment,
  T_SaveMenuAssignmentDto,
  T_UpdateMenuDto,
} from "@/entities/menu";

export type T_MenusApiErrorCode =
  | "NOT_FOUND"
  | "DUPLICATE_KEY"
  | "INVALID_KEY"
  | "INVALID_CONTENT"
  | "INVALID_MENU"
  | "DUPLICATE_ASSIGNMENT"
  | "SIDEBAR_REGION_CONFLICT"
  | "STORAGE_UNAVAILABLE"
  | "STORAGE_WRITE_FAILED";

export type T_MenusApiContract = {
  getMenus: () => Promise<T_Menu[]>;
  getMenuById: (id: string) => Promise<T_Menu>;
  getMenuByKey: (key: string) => Promise<T_Menu>;
  createMenu: (input: T_CreateMenuDto) => Promise<T_Menu>;
  updateMenu: (input: T_UpdateMenuDto) => Promise<T_Menu>;
  duplicateMenu: (id: string) => Promise<T_Menu>;
  deleteMenu: (id: string) => Promise<string>;
  getMenuAssignments: () => Promise<T_MenuAssignment[]>;
  saveMenuAssignment: (input: T_SaveMenuAssignmentDto) => Promise<T_MenuAssignment>;
  deleteMenuAssignment: (id: string) => Promise<string>;
};

export class MenusApiError extends ApiError<T_MenusApiErrorCode> {
  constructor(public readonly code: T_MenusApiErrorCode, message: string) {
    super(code, message);
    this.name = "MenusApiError";
  }
}
