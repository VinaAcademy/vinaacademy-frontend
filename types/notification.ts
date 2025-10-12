/**
 * Notification types matching backend enum
 */
export enum NotificationType {
  SYSTEM = 'SYSTEM',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  COURSE_REVIEW = 'COURSE_REVIEW',
  COURSE_APPROVAL = 'COURSE_APPROVAL',
  SUPPORT_REPLY = 'SUPPORT_REPLY',
  PROMOTION = 'PROMOTION',
  FINANCIAL_ALERT = 'FINANCIAL_ALERT',
  STAFF_REQUEST = 'STAFF_REQUEST',
  INSTRUCTOR_REQUEST = 'INSTRUCTOR_REQUEST',
  MESSAGE = 'MESSAGE', // Chat message notification
}

/**
 * Notification DTO matching backend structure
 */
export interface NotificationDTO {
  id: string; // UUID as string
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string; // ISO date string
  readAt: string | null; // ISO date string or null
  targetUrl: string | null;
  type: NotificationType;
  email?: string;
  userId?: string;
}
