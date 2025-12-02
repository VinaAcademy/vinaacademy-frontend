/**
 * Lesson Attachment Service
 * Handles attachment operations for lessons (attach documents, remove attachments, get attachments)
 */

import apiClient from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/config/api.endpoint'
import { MediaFileDto } from '@/types/lesson'

/**
 * Attach documents to a lesson
 * @param lessonId - The lesson ID
 * @param fileIds - Array of file IDs to attach
 * @returns Success status
 */
export async function attachDocuments(
  lessonId: string,
  fileIds: string[],
): Promise<boolean> {
  try {
    await apiClient.post(
      API_ENDPOINTS.LESSON.ATTACH_DOCUMENTS(lessonId),
      fileIds,
    )
    return true
  } catch (error) {
    console.error(`attachDocuments error for lesson ${lessonId}:`, error)
    return false
  }
}

/**
 * Remove an attachment from a lesson
 * @param lessonId - The lesson ID
 * @param fileId - The file ID to remove
 * @returns Success status
 */
export async function removeAttachment(
  lessonId: string,
  fileId: string,
): Promise<boolean> {
  try {
    await apiClient.delete(
      API_ENDPOINTS.LESSON.REMOVE_ATTACHMENT(lessonId, fileId),
    )
    return true
  } catch (error) {
    console.error(
      `removeAttachment error for lesson ${lessonId}, file ${fileId}:`,
      error,
    )
    return false
  }
}

/**
 * Get all attachments of a lesson
 * @param lessonId - The lesson ID
 * @returns Array of MediaFileDto or null on error
 */
export async function getAttachments(
  lessonId: string,
): Promise<MediaFileDto[] | null> {
  try {
    const response = await apiClient.get(
      API_ENDPOINTS.LESSON.ATTACHMENTS(lessonId),
    )
    return response.data.data
  } catch (error) {
    console.error(`getAttachments error for lesson ${lessonId}:`, error)
    return null
  }
}

/**
 * Get presigned download URL for an attachment
 * @param lessonId - The lesson ID
 * @param attachmentId - The attachment ID
 * @returns Presigned download URL or null on error
 */
export async function getAttachmentDownloadUrl(
  lessonId: string,
  attachmentId: string,
): Promise<string | null> {
  try {
    const response = await apiClient.get(
      API_ENDPOINTS.LESSON.ATTACHMENT_DOWNLOAD_URL(lessonId, attachmentId),
    )

    // Backend returns URL in 'message' field instead of 'data'
    // Response structure: { status: "SUCCESS", message: "presigned-url", timestamp: "..." }
    const url = response.data.message || response.data.data

    if (!url) {
      console.error('No URL found in response:', response.data)
      return null
    }

    return url
  } catch (error) {
    console.error(
      `getAttachmentDownloadUrl error for lesson ${lessonId}, attachment ${attachmentId}:`,
      error,
    )
    return null
  }
}
