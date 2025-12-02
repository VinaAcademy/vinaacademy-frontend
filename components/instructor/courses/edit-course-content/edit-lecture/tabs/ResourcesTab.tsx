import { Plus, AlertCircle, Upload } from 'lucide-react'
import { Resource } from '@/types/lecture'
import { MediaFileDto } from '@/types/lesson'
import ResourceItem from '../resources/ResourceItem'
import AttachmentUploader from '@/components/instructor/lesson/AttachmentUploader'
import AttachmentList from '../resources/AttachmentList'
import { useLectureEdit } from '@/context/LectureEditContext'
import { createSuccessToast } from '@/components/ui/toast-cus'

export default function ResourcesTab() {
  const { lecture, setLecture } = useLectureEdit()

  const addResource = () => {
    const newResource: Resource = {
      id: `r${Date.now()}`,
      title: 'Tài liệu mới',
      type: 'pdf',
      url: '',
    }

    setLecture({
      ...lecture,
      resources: [...(lecture.resources || []), newResource],
    })
  }

  const removeResource = (resourceId: string) => {
    setLecture({
      ...lecture,
      resources: (lecture.resources || []).filter((r) => r.id !== resourceId),
    })
  }

  const handleResourceChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const newResources = [...(lecture.resources || [])]
    newResources[index] = {
      ...newResources[index],
      [field]: value,
    }
    setLecture({ ...lecture, resources: newResources })
  }

  // Handle attachment upload
  const handleFileUploaded = (file: MediaFileDto) => {
    setLecture({
      ...lecture,
      attachments: [...(lecture.attachments || []), file],
    })
  }

  // Handle attachment removal
  const handleRemoveAttachment = (attachmentId: string) => {
    setLecture({
      ...lecture,
      attachments: (lecture.attachments || []).filter(
        (a) => a.id !== attachmentId,
      ),
    })
    createSuccessToast('Đã xóa tài liệu đính kèm')
  }

  return (
    <div>
      {/* Attachments Section - Upload real files */}
      <div className="mb-8">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tài liệu đính kèm
          </h3>
          <p className="text-sm text-gray-500">
            Tải lên tài liệu để học viên có thể tải xuống (PDF, Word, Excel,
            PowerPoint, ZIP)
          </p>
        </div>

        {/* File Uploader */}
        <div className="mb-4">
          <AttachmentUploader
            onFileUploaded={handleFileUploaded}
            maxSizeMB={50}
          />
        </div>

        {/* Uploaded Files List */}
        <AttachmentList
          attachments={lecture.attachments || []}
          onRemove={handleRemoveAttachment}
        />
      </div>

      {/* Divider */}
      <div className="my-8 border-t border-gray-200" />

      {/* Legacy Resources Section - URL-based resources */}
      <div className="mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tài liệu bổ sung (URL)
          </h3>
          <p className="text-sm text-gray-500">
            Thêm liên kết đến các tài liệu bên ngoài
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {lecture.resources && lecture.resources.length > 0 ? (
            lecture.resources.map((resource, index) => (
              <ResourceItem
                key={resource.id}
                resource={resource}
                index={index}
                handleResourceChange={handleResourceChange}
                removeResource={removeResource}
              />
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              Chưa có tài liệu bổ sung nào.
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={addResource}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            <Plus className="h-4 w-4 mr-2" /> Thêm liên kết tài liệu
          </button>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Mẹo: Hãy cung cấp tài liệu bổ sung liên quan để học viên có thể
                củng cố kiến thức sau khi học xong bài giảng. Bạn có thể tải lên
                file trực tiếp hoặc thêm liên kết đến tài liệu bên ngoài.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
