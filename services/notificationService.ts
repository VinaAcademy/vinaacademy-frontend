// services/notificationService.ts
import axios, { AxiosResponse } from "axios";
import {
  NotificationCreateDTO,
  NotificationDTO,
  NotificationType,
  NotificationFetchParams,
  NotificationPageResponse,
} from "@/types/notification-type";
import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/api-response";

export const createNotification = async (notificationData: {
  title: string;
  content: string;
  targetUrl: string;
  type: NotificationType;
  userId: string;
}): Promise<NotificationCreateDTO> => {
  try {
    const response: AxiosResponse = await apiClient.post<NotificationCreateDTO>(
      "/notifications",
      notificationData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating notification:", error);
    return {} as NotificationCreateDTO; // Return an empty object with error
  }
};

export const fetchUserNotifications = async ({
  type = null,
  isRead = null,
  page = 0,
  size = 8,
  sortBy = "createdAt",
  direction = "desc",
}: NotificationFetchParams): Promise<NotificationPageResponse> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();

    if (type) params.append("type", type);
    if (isRead !== null) params.append("isRead", isRead.toString());
    params.append("page", page.toString());
    params.append("size", size.toString());
    params.append("sortBy", sortBy);
    params.append("direction", direction);
    const response = await apiClient.get<AxiosResponse<NotificationPageResponse>>(
      `/notifications/paginated?${params.toString()}`
    );
    // const response = await axios.get<NotificationPageResponse>(
    //   `${API_URL}/notifications/user/${userId}/paginated?${params.toString()}`
    // );
    console.log("Response data:", response.data.data.content);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {} as NotificationPageResponse; // Return an empty object with error
  }
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<boolean> => {
  try {
    await apiClient.put(`/notifications/${notificationId}/read`);
    // await axios.put(`${API_URL}/notifications/${notificationId}/read`);
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

export const deleteNotification = async (
  notificationId: string
): Promise<boolean> => {
  try {
    await apiClient.delete(`/notifications/${notificationId}`);
    // await axios.delete(`${API_URL}/notifications/${notificationId}`);

    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
};

export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    await apiClient.post(`/notifications/readall`);
    // await axios.put(`${API_URL}/notifications/user/${userId}/read-all`);

    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};
