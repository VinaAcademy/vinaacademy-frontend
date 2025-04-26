import {useState, useEffect} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Header from './LectureHeader';
import TabNavigation from './TabNavigation';
import ContentTab from './tabs/ContentTab';
import ResourcesTab from './tabs/ResourcesTab';
import SettingsTab from './tabs/SettingsTab';
import Footer from './LectureFooter';
import {Lecture, LectureType} from '@/types/lecture';
import {toast} from 'react-toastify';
import {Loader2} from 'lucide-react';
import { getLessonById, updateLesson } from '@/services/lessonService';
import { lessonToLecture, lectureToLessonRequest } from '@/utils/adapters/lessonAdapter';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Create a default lecture object to initialize the state
const createDefaultLecture = (): Lecture => ({
    id: '',
    title: 'Bài giảng mới',
    type: 'video' as LectureType,
    description: '',
    duration: '0',
    resources: []
});

export default function LectureEditor() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.id as string;
    const lectureId = params.lectureId as string;
    
    const [activeTab, setActiveTab] = useState<'content' | 'resources' | 'settings'>('content');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const queryClient = useQueryClient();
    
    // Use React Query to fetch and cache the lesson data
    const { data: lessonData, isLoading, error } = useQuery({
        queryKey: ['lesson', lectureId],
        queryFn: () => getLessonById(lectureId),
        enabled: !!lectureId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    // Convert lesson data to lecture format for the editor
    const [lecture, setLecture] = useState<Lecture>(createDefaultLecture());
    const [sectionId, setSectionId] = useState<string>('');
    
    // Update local state when query data changes
    useEffect(() => {
        if (lessonData) {
            const convertedLecture = lessonToLecture(lessonData);
            setLecture(convertedLecture);
            setSectionId(lessonData.sectionId);
        }
    }, [lessonData]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            
            if (!sectionId) {
                toast.error("Không tìm thấy thông tin phần học");
                setIsSaving(false);
                return;
            }
            
            // Convert Lecture to LessonRequest using the adapter
            const lessonRequest = lectureToLessonRequest(lecture, sectionId);
            
            // Update the lesson
            const updatedLesson = await updateLesson(lectureId, lessonRequest);
            
            if (updatedLesson) {
                // Success
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
                
                // Invalidate and refetch the lesson query to ensure fresh data
                queryClient.invalidateQueries({ queryKey: ['lesson', lectureId] });
                
                // Also invalidate the section lessons list query to update the UI when returning to the list
                if (sectionId) {
                    queryClient.invalidateQueries({ queryKey: ['lessons', 'section', sectionId] });
                }
                
                toast.success("Đã lưu thay đổi thành công");
                
                // Convert back and update the local state to ensure it's in sync
                setLecture(lessonToLecture(updatedLesson));
            } else {
                throw new Error("Failed to update lesson");
            }
        } catch (error) {
            console.error("Error saving lecture:", error);
            toast.error("Không thể lưu bài giảng. Vui lòng thử lại sau.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-black" />
                <span className="ml-2 text-lg">Đang tải bài giảng...</span>
            </div>
        );
    }

    return (
        <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Header
                    isSaving={isSaving}
                    handleSave={handleSave}
                    courseId={courseId}
                    saveSuccess={saveSuccess}
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab}/>

                    <div className="p-6">
                        {activeTab === 'content' && (
                            <ContentTab
                                lecture={lecture}
                                setLecture={setLecture}
                            />
                        )}

                        {activeTab === 'resources' && (
                            <ResourcesTab
                                lecture={lecture}
                                setLecture={setLecture}
                            />
                        )}

                        {activeTab === 'settings' && (
                            <SettingsTab
                                lecture={lecture}
                                setLecture={setLecture}
                            />
                        )}
                    </div>

                    <Footer
                        courseId={courseId}
                        isSaving={isSaving}
                        handleSave={handleSave}
                    />
                </div>
            </div>
        </div>
    );
}