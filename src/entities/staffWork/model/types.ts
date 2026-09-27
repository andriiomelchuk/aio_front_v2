import type { T_ServiceMaterial } from "@/entities/service";
import type { T_Employee } from "@/entities/employee";

export type T_StaffWorkStatus = "planned" | "in_progress" | "completed" | "approved" | "void";
export type T_StaffWorkSplitMode = "equal" | "percentage" | "fixed";
export type T_StaffWorkPerformer = { employeeId: string; employeeName: string; isPrimary: boolean; percentage?: number; amount?: number };
export type T_StaffWorkAuditAction = "create" | "start" | "complete" | "approve" | "correct" | "void";
export type T_StaffWorkAuditEntry = {
  id: string;
  action: T_StaffWorkAuditAction;
  createdAt: string;
  createdBy: string;
  note: string;
  snapshot: { status: T_StaffWorkStatus; totalAmount: number; performers: T_StaffWorkPerformer[] };
};
export type T_StaffWorkServiceSnapshot = { id: string; title: string; categoryId: string; price: number; currency: string; durationMinutes: number; materials: T_ServiceMaterial[] };

export type T_StaffWorkRecord = {
  id: string;
  service: T_StaffWorkServiceSnapshot;
  performedAt: string;
  durationMinutes: number;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalAmount: number;
  currency: string;
  materials: T_ServiceMaterial[];
  notes: string;
  splitMode: T_StaffWorkSplitMode;
  performers: T_StaffWorkPerformer[];
  appointmentId?: string;
  customerId?: string;
  orderId?: string;
  paymentId?: string;
  status: T_StaffWorkStatus;
  audit: T_StaffWorkAuditEntry[];
  createdAt: string;
  updatedAt: string;
};

export type T_CreateStaffWorkDto = {
  serviceId: string;
  performedAt: string;
  durationMinutes?: number;
  quantity: number;
  unitPrice?: number;
  discount: number;
  materials?: T_ServiceMaterial[];
  notes: string;
  splitMode: T_StaffWorkSplitMode;
  performers: Array<Pick<T_StaffWorkPerformer, "employeeId" | "percentage" | "amount"> & Partial<Pick<T_StaffWorkPerformer, "isPrimary">>>;
  appointmentId?: string;
  customerId?: string;
  orderId?: string;
  paymentId?: string;
  createdBy: string;
};

export type T_UpdateStaffWorkDto = Partial<Pick<T_StaffWorkRecord, "performedAt" | "durationMinutes" | "quantity" | "unitPrice" | "discount" | "materials" | "notes" | "splitMode" | "performers" | "appointmentId" | "customerId" | "orderId" | "paymentId">> & { id: string; updatedBy: string; reason: string };
export type T_ChangeStaffWorkStatusDto = { id: string; status: T_StaffWorkStatus; updatedBy: string; note: string };
export type T_StaffWorkState = { employees: T_Employee[]; workRecords: T_StaffWorkRecord[] };
