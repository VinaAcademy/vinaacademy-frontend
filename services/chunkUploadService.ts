import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/api-response";
import { API_ENDPOINTS } from "@/config/api.endpoint";

// Types cho chunk upload
export interface InitiateUploadRequest {
  filename: string;
  fileSize: number;
  fileType: 'VIDEO' | 'IMAGE' | 'DOCUMENT' | 'OTHER';
  fileHash?: string;
  chunkSize: number;
}

export interface ChunkUploadRequest {
  sessionId: string;
  chunkNumber: number;
  chunkHash?: string;
}

export interface UploadSessionDto {
  sessionId: string;
  filename: string;
  fileSize: number;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number;
  status: 'INITIATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  expiresAt: string;
  progressPercentage: number;
}

export interface ChunkUploadResult {
  success: boolean;
  data?: UploadSessionDto;
  error?: string;
}

// Service functions
export const initiateChunkUpload = async (
  request: InitiateUploadRequest,
  signal?: AbortSignal
): Promise<ChunkUploadResult> => {
  try {
    const response = await apiClient.post<ApiResponse<UploadSessionDto>>(
      API_ENDPOINTS.CHUNK_UPLOAD.INITIATE,
      request,
      { signal }
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Failed to initiate chunk upload:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to initiate upload' 
    };
  }
};

export const uploadChunk = async (
  chunkFile: Blob,
  request: ChunkUploadRequest
): Promise<ChunkUploadResult> => {
  try {
    const formData = new FormData();
    formData.append('chunk', chunkFile);
    formData.append('sessionId', request.sessionId);
    formData.append('chunkNumber', request.chunkNumber.toString());
    if (request.chunkHash) {
      formData.append('chunkHash', request.chunkHash);
    }

    const response = await apiClient.post<ApiResponse<UploadSessionDto>>(
      API_ENDPOINTS.CHUNK_UPLOAD.UPLOAD,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Failed to upload chunk:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to upload chunk' 
    };
  }
};

export const getUploadStatus = async (sessionId: string): Promise<ChunkUploadResult> => {
  try {
    const response = await apiClient.get<ApiResponse<UploadSessionDto>>(
      API_ENDPOINTS.CHUNK_UPLOAD.STATUS(sessionId)
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Failed to get upload status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get status' 
    };
  }
};

export const cancelUpload = async (sessionId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.delete(`/storage/chunk-upload/cancel/${sessionId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to cancel upload:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to cancel upload' 
    };
  }
};