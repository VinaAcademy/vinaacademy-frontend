import apiClient from "@/lib/apiClient";
import { PaginatedResponse } from "@/types/api-response";
import { DiscussionDto, DiscussionRequest } from "@/types/discussion";
import { AxiosResponse } from "axios";


export async function getRootCommentsPaginated(
  lessonId: string,
  page = 0,
  size = 10,
  sortBy = "createdDate",
  direction: "ASC" | "DESC" = "DESC"
): Promise<PaginatedResponse<DiscussionDto> | null> {
  try {
    const response: AxiosResponse = await apiClient.get(`/discussions/${lessonId}`, {
      params: {
        page,
        size,
        sortBy,
        direction,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("getRootComments error:", error);
    return null;
  }
}

export async function getRepliesPaginated(
  parentId: string,
  page = 0,
  size = 10,
  sortBy = "createdDate",
  direction: "ASC" | "DESC" = "ASC"
): Promise<PaginatedResponse<DiscussionDto> | null> {
  try {
    const response: AxiosResponse= await apiClient.get(`/discussions/${parentId}/replies`, {
      params: {
        page,
        size,
        sort: `${sortBy},${direction}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("getReplies error:", error);
    return null;
  }
}

export async function createDiscussion(
  request: DiscussionRequest
): Promise<DiscussionDto | null> {
  try {
    const response: AxiosResponse =
      await apiClient.post("/discussions", request);
    return response.data.data;
  } catch (error) {
    console.error("createDiscussion error:", error);
    return null;
  }
}

export async function toggleFavorite(
  commentId: string,
  isLiked: boolean
): Promise<boolean | null> {
  try {
    if (isLiked) {
      const response: AxiosResponse =
      await apiClient.delete("/favorites/"+commentId);
      return false;
    }else {
   
      const response: AxiosResponse =
      await apiClient.post("/favorites", { commentId });
      return true;
    }
    
  } catch (error) {
    console.error("toggleFavorite error:", error);
    return null;
  }
}

export async function deleteDiscussion(discussionId: string): Promise<boolean> {
  try {
    const response: AxiosResponse = await apiClient.post(
      `/discussions/delete/${discussionId}`
    );
    return true;
  } catch (error) {
    console.error("deleteDiscussion error:", error);
    return false;
  }
}
