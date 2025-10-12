// types/notification.ts

export enum NotificationType {
  SYSTEM = "SYSTEM",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  COURSE_REVIEW = "COURSE_REVIEW",
  COURSE_APPROVAL = "COURSE_APPROVAL",
  SUPPORT_REPLY = "SUPPORT_REPLY",
  PROMOTION = "PROMOTION",
  FINANCIAL_ALERT = "FINANCIAL_ALERT",
  STAFF_REQUEST = "STAFF_REQUEST",
  INSTRUCTOR_REQUEST = "INSTRUCTOR_REQUEST",
  MESSAGE = "MESSAGE",
}

export interface NotificationCreateDTO {
  content: string;
  targetUrl: string;
  title: string;
  type: NotificationType;
  userId: string;
}

export interface NotificationDTO {
  id: string;
  createdAt: string;
  content: string;
  isDeleted: boolean;
  isRead: boolean;
  readAt: string | null;
  targetUrl: string;
  title: string;
  type: NotificationType;
}

export interface NotificationFilters {
  type: NotificationType | null;
  isRead: boolean | null;
  sortBy: string;
  direction: "asc" | "desc";
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
}

export interface NotificationFetchParams {
  type?: NotificationType | null;
  isRead?: boolean | null;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
}

export interface NotificationPageResponse {
  content: NotificationDTO[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
