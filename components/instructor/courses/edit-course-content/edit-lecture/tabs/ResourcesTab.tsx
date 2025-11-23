import { Plus, AlertCircle } from 'lucide-react'
import { Resource } from '@/types/lecture'
import ResourceItem from '../resources/ResourceItem'
import { useLectureEdit } from '@/context/LectureEditContext'

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

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Tài liệu bổ sung
        </h3>
        <p className="text-sm text-gray-500">
          Cung cấp các tài liệu bổ sung để học viên có thể tải xuống
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
          <div className="text-center py-4 text-gray-500">
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
          <Plus className="h-4 w-4 mr-2" /> Thêm tài liệu
        </button>
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
                củng cố kiến thức sau khi học xong bài giảng.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
