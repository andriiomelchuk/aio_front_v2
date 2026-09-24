import type { T_Appointment, T_AppointmentStatus, T_CreateAppointmentDto, T_Service, T_ServiceCategory, T_ServiceLocation, T_ServiceProvider, T_ServicesState } from "@/entities/service";
import { ApiError } from "@/shared/api/core";

export type T_ServicesApiErrorCode = "NOT_FOUND" | "INVALID_INPUT" | "CONFLICT" | "STORAGE_FAILED";
export class ServicesApiError extends ApiError<T_ServicesApiErrorCode> {}

export type T_SaveServiceDto = Omit<T_Service, "id" | "createdAt" | "updatedAt"> & { id?: string };
export type T_SaveServiceCategoryDto = Omit<T_ServiceCategory, "id"> & { id?: string };
export type T_SaveServiceProviderDto = Omit<T_ServiceProvider, "id"> & { id?: string };
export type T_SaveServiceLocationDto = Omit<T_ServiceLocation, "id"> & { id?: string };
export type T_UpdateAppointmentDto = {
  id: string;
  status?: T_AppointmentStatus;
  startAt?: string;
  providerId?: string;
  locationId?: string;
  adminNote?: string;
  cancellationReason?: string;
  updatedBy: string;
};

export type T_ServicesApiContract = {
  getState: () => Promise<T_ServicesState>;
  saveService: (input: T_SaveServiceDto) => Promise<T_Service>;
  saveCategory: (input: T_SaveServiceCategoryDto) => Promise<T_ServiceCategory>;
  saveProvider: (input: T_SaveServiceProviderDto) => Promise<T_ServiceProvider>;
  saveLocation: (input: T_SaveServiceLocationDto) => Promise<T_ServiceLocation>;
  createAppointment: (input: T_CreateAppointmentDto) => Promise<T_Appointment>;
  updateAppointment: (input: T_UpdateAppointmentDto) => Promise<T_Appointment>;
};
