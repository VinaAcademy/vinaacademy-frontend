# Lesson Attachments Feature - Frontend Implementation

## 📋 Tổng quan

Tính năng đính kèm tài liệu cho phép giảng viên upload và đính kèm các file tài liệu (PDF, Word, Excel, PowerPoint, v.v.) vào bài giảng để học viên có thể tải xuống.

## 🎯 Components

### 1. Instructor Components

#### `AttachmentUploader`

Component cho phép instructor upload file tài liệu.

**Location:** `components/instructor/lesson/AttachmentUploader.tsx`

**Props:**

```typescript
interface AttachmentUploaderProps {
  onFileUploaded: (file: MediaFileDto) => void // Callback khi upload thành công
  disabled?: boolean // Disable upload
  maxSizeMB?: number // Giới hạn kích thước file (mặc định: 50MB)
}
```

**Features:**

- Drag & drop support
- File type validation (PDF, Word, Excel, PowerPoint, ZIP, TXT)
- File size validation
- Visual feedback (loading states, error messages)
- Toast notifications

**Usage:**

```tsx
import AttachmentUploader from '@/components/instructor/lesson/AttachmentUploader'

;<AttachmentUploader
  onFileUploaded={(file) => {
    setAttachments((prev) => [...prev, file])
  }}
  maxSizeMB={50}
/>
```

#### `AttachmentList`

Component hiển thị danh sách attachments với khả năng xóa.

**Location:** `components/instructor/lesson/AttachmentList.tsx`

**Props:**

```typescript
interface AttachmentListProps {
  attachments: MediaFileDto[] // Danh sách attachments
  onRemove: (fileId: string) => void // Callback khi xóa
  editable?: boolean // Cho phép chỉnh sửa (mặc định: true)
}
```

**Features:**

- Hiển thị file icon theo loại file
- Format file size (B, KB, MB)
- Remove attachment với confirmation
- Empty state
- Framer Motion animations

**Usage:**

```tsx
import AttachmentList from '@/components/instructor/lesson/AttachmentList'

;<AttachmentList
  attachments={attachments}
  onRemove={(fileId) => {
    setAttachments((prev) => prev.filter((att) => att.id !== fileId))
  }}
  editable={true}
/>
```

### 2. Student Component

#### `LessonAttachments`

Component hiển thị attachments cho học viên với nút download.

**Location:** `components/student/lesson/LessonAttachments.tsx`

**Props:**

```typescript
interface LessonAttachmentsProps {
  attachments?: MediaFileDto[] // Danh sách attachments từ lesson
}
```

**Features:**

- Beautiful gradient design
- File icons theo loại
- Download button
- File size display
- Responsive layout
- Framer Motion animations

**Usage:**

```tsx
import LessonAttachments from '@/components/student/lesson/LessonAttachments'

;<LessonAttachments attachments={lesson.attachments} />
```

## 🔧 Services

### `lessonAttachmentService`

**Location:** `services/lessonAttachmentService.ts`

**Functions:**

```typescript
// Attach documents to lesson
attachDocuments(lessonId: string, fileIds: string[]): Promise<boolean>

// Remove attachment from lesson
removeAttachment(lessonId: string, fileId: string): Promise<boolean>

// Get all attachments of lesson
getAttachments(lessonId: string): Promise<MediaFileDto[] | null>
```

## 📊 Types

### `MediaFileDto`

**Location:** `types/lesson.ts`

```typescript
export type FileType = 'VIDEO' | 'IMAGE' | 'DOCUMENT' | 'OTHER'

export interface MediaFileDto extends BaseDto {
  id: string
  userId: string
  fileName: string
  fileType: FileType
  mimeType?: string
  fileSize?: number
  filePath?: string // Not exposed to frontend
}
```

### Updates to `LessonDto` và `LessonRequest`

```typescript
export interface LessonDto extends BaseDto {
  // ... existing fields
  attachments?: MediaFileDto[] // NEW
}

export interface LessonRequest {
  // ... existing fields
  attachmentIds?: string[] // NEW
}
```

## 🚀 Integration Example

### LectureEditModal Integration

**File:** `components/instructor/courses/LectureEditModal.tsx`

```tsx
import { MediaFileDto } from '@/types/lesson'
import AttachmentUploader from '@/components/instructor/lesson/AttachmentUploader'
import AttachmentList from '@/components/instructor/lesson/AttachmentList'

// State
const [attachments, setAttachments] = useState<MediaFileDto[]>([])

// Load attachments from lecture
useEffect(() => {
  if (lecture) {
    setAttachments(lecture.attachments || [])
  }
}, [lecture])

// Submit với attachmentIds
const handleSubmit = async (e) => {
  const lectureData = {
    // ... other fields
    attachmentIds: attachments.map((att) => att.id),
  }

  await createLesson(lectureData) // hoặc updateLesson
}

// Render
;<div>
  {attachments.length > 0 && (
    <AttachmentList
      attachments={attachments}
      onRemove={(fileId) => {
        setAttachments((prev) => prev.filter((att) => att.id !== fileId))
      }}
    />
  )}

  <AttachmentUploader
    onFileUploaded={(file) => {
      setAttachments((prev) => [...prev, file])
    }}
  />
</div>
```

### Student Lesson View Integration

```tsx
import { LessonAttachments } from '@/components/student/lesson'

function LessonView({ lesson }: { lesson: LessonDto }) {
  return (
    <div>
      {/* Lesson content */}

      {/* Attachments section */}
      <LessonAttachments attachments={lesson.attachments} />
    </div>
  )
}
```

## 🎨 Styling

Tất cả components đều sử dụng:

- **Tailwind CSS** cho styling
- **Lucide React** cho icons
- **Framer Motion** cho animations
- Consistent với design system của VinaAcademy

### Color Scheme

- Primary: Blue (500-600)
- Secondary: Purple (500-600)
- Success: Green
- Error: Red
- File types: Các màu distinct cho mỗi loại file

## 📝 API Endpoints

Tất cả endpoints được define trong `config/api.endpoint.ts`:

```typescript
LESSON: {
  ATTACHMENTS: (lessonId: string) => `/lessons/${lessonId}/attachments`,
  ATTACH_DOCUMENTS: (lessonId: string) => `/lessons/${lessonId}/attachments`,
  REMOVE_ATTACHMENT: (lessonId: string, fileId: string) =>
    `/lessons/${lessonId}/attachments/${fileId}`,
}
```

## ✅ File Type Support

### Supported Types

- **PDF**: `.pdf`
- **Word**: `.doc`, `.docx`
- **Excel**: `.xls`, `.xlsx`
- **PowerPoint**: `.ppt`, `.pptx`
- **Text**: `.txt`
- **Archive**: `.zip`

### Max File Size

- Default: **50 MB**
- Configurable via `maxSizeMB` prop

## 🔒 Security

- File type validation trên frontend
- File size validation trên frontend
- Backend validation cho tất cả uploads
- Files không được expose trực tiếp (dùng presigned URLs)
- Authorization check cho attach/remove operations

## 🧪 Testing

### Manual Testing Checklist

- [ ] Upload PDF file → Success
- [ ] Upload Word file → Success
- [ ] Upload file > 50MB → Error message
- [ ] Upload invalid type (e.g., .exe) → Error message
- [ ] Drag & drop file → Success
- [ ] Remove attachment → Success
- [ ] Create lesson với attachments → Attachments saved
- [ ] Update lesson với new attachments → Attachments updated
- [ ] Student view attachments → Displayed correctly
- [ ] Download attachment → File downloaded

## 📱 Responsive Design

Tất cả components đều responsive:

- **Mobile**: Single column, stacked layout
- **Tablet**: Optimized spacing
- **Desktop**: Full layout với proper spacing

## 🎯 Future Enhancements

1. **Attachment Metadata**: Add title, description cho mỗi attachment
2. **Ordering**: Drag & drop để sắp xếp attachments
3. **Download Statistics**: Track số lượt download
4. **Bulk Operations**: Upload/remove multiple files cùng lúc
5. **Preview**: Preview file trước khi download
6. **File Versioning**: Support multiple versions của cùng file

## 📞 Support

Nếu có vấn đề, check:

1. Backend API đã implement đầy đủ chưa
2. File upload service (`imageService.ts`) hoạt động chưa
3. Authorization tokens hợp lệ chưa
4. Network requests trong DevTools

## 🔗 Related Files

- Types: `types/lesson.ts`
- API Config: `config/api.endpoint.ts`
- Services: `services/lessonAttachmentService.ts`, `services/imageService.ts`
- Components: `components/instructor/lesson/`, `components/student/lesson/`
- Integration: `components/instructor/courses/LectureEditModal.tsx`
