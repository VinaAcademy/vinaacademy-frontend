/**
 * Document Service
 * Handles document file uploads (PDF, Word, Excel, PowerPoint, etc.)
 * Used for lesson attachments and other document management
 */

import apiClient from '@/lib/apiClient'
import { MediaFileDto } from '@/types/file-type'
import { AxiosResponse } from 'axios'
import { API_ENDPOINTS } from '@/config/api.endpoint'

/**
 * Upload a document file
 * Backend will validate that file type is DOCUMENT or OTHER
 * @param file - The document file to upload
 * @returns MediaFileDto with type DOCUMENT or null on error
 */
export async function uploadDocument(file: File): Promise<MediaFileDto | null> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response: AxiosResponse = await apiClient.post(
      API_ENDPOINTS.DOCUMENT.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    return response.data.data
  } catch (error) {
    console.error('uploadDocument error:', error)
    return null
  }
}
