"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CourseData, CourseSection } from '@/types/new-course';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getCourseBySlug, getCourseIdBySlug, getCourseSlugById, updateCourse, deleteCourse, submitCourseForReview } from '@/services/courseService';
import { CourseDetailsResponse, CourseDto, CourseRequest } from '@/types/course';
import { uploadImage } from '@/services/imageService';

// Import the sections
import CourseFormHeader from '@/components/instructor/courses/new-course/CourseFormHeader';
import CourseFormNavigation from '@/components/instructor/courses/new-course/CourseFormNavigation';
import BasicInfoSection from '@/components/instructor/courses/edit-course/BasicInfoSection';
import MediaSection from '@/components/instructor/courses/edit-course/MediaSection';
import PricingSection from '@/components/instructor/courses/edit-course/PricingSection';
import FormFooter from '@/components/instructor/courses/new-course/FormFooter';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { EditorTextChangeEvent } from 'primereact/editor';
import { getImageUrl } from '@/utils/imageUtils';

export default function EditCoursePage() {
    const params = useParams();
    const courseId = params.id as string;
    const router = useRouter();
    
    const [activeSection, setActiveSection] = useState<CourseSection>('basic');
    const [courseData, setCourseData] = useState<CourseData>({
        title: '',
        subtitle: '',
        description: '',
        category: '',
        level: '',
        language: 'Tiếng việt',
        slug: '',
        price: 0,
        thumbnail: null,
    });
    
    const [course, setCourse] = useState<CourseDetailsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [progress, setProgress] = useState(33);
    const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);
    const [formSaving, setFormSaving] = useState(false);
    
    // Fetch course data
    useEffect(() => {
        const fetchCourseData = async () => {
            setLoading(true);
            try {
                // First get slug from ID
                const slug = await getCourseSlugById(courseId);
                if (!slug) {
                    toast({
                        title: 'Lỗi',
                        description: 'Không thể tìm thấy khóa học',
                        variant: 'destructive',
                    });
                    router.push('/instructor/courses');
                    return;
                }
                const courseDetails = await getCourseBySlug(slug);
                
                if (!courseDetails) {
                    toast({
                        title: 'Lỗi',
                        description: 'Không thể tìm thấy thông tin khóa học',
                        variant: 'destructive',
                    });
                    router.push('/instructor/courses');
                    return;
                }
                
                setCourse(courseDetails);
                
                // Populate course data
                setCourseData({
                    title: courseDetails.name || '',
                    subtitle: '',
                    description: courseDetails.description || '',
                    category: String(courseDetails.categorySlug) || '',
                    level: courseDetails.level || '',
                    language: courseDetails.language || 'Tiếng việt',
                    slug: courseDetails.slug || '',
                    price: courseDetails.price || 0,
                    thumbnail: null,
                });
                
                // Set thumbnail preview if available
                if (courseDetails.image) {
                    setPreviewThumbnail(getImageUrl(courseDetails.image));
                }
                
            } catch (error) {
                console.error('Error fetching course data:', error);
                toast({
                    title: 'Lỗi',
                    description: 'Không thể tải thông tin khóa học',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };
        
        fetchCourseData();
    }, [courseId, router]);
    
    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCourseData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Auto-save indicator
        setFormSaving(true);
        setTimeout(() => setFormSaving(false), 1000);
    };
    
    const onEditorChange = (e: EditorTextChangeEvent) => {
        const {htmlValue} = e;
        setCourseData(prev => ({
            ...prev,
            description: htmlValue || ''
        }));
        
        // Show auto-save indicator
        setFormSaving(true);
        setTimeout(() => setFormSaving(false), 1000);
    }
    
    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const { name, value } = e.target;
        setCourseData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Auto-save indicator
        setFormSaving(true);
        setTimeout(() => setFormSaving(false), 1000);
    }
    
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setCourseData(prev => ({
            ...prev,
            [name]: checked
        }));
        
        // Auto-save indicator
        setFormSaving(true);
        setTimeout(() => setFormSaving(false), 1000);
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files.length > 0) {
            setCourseData(prev => ({
                ...prev,
                [name]: files[0]
            }));
            
            // Create preview URL
            if (name === 'thumbnail') {
                const url = URL.createObjectURL(files[0]);
                setPreviewThumbnail(url);
            }
            
            // Auto-save indicator
            setFormSaving(true);
            setTimeout(() => setFormSaving(false), 1000);
        }
    };
    
    // Section validation
    const isBasicSectionComplete = () => {
        return courseData.title !== '' && courseData.description !== '' &&
            courseData.category !== '' && courseData.level !== '';
    };
    
    const isPriceSectionComplete = () => {
        return courseData.price >= 0 && courseData.price <= 5000000;
    }
    
    const isMediaSectionComplete = () => {
        // For edit, we don't require thumbnail if it's already set
        return previewThumbnail !== null;
    };
    
    // Navigation
    const updateSection = (section: CourseSection) => {
        setActiveSection(section);
        
        // Update progress based on section
        if (section === 'basic') setProgress(33);
        if (section === 'media') setProgress(66);
        if (section === 'pricing') setProgress(100);
    };
    
    const handleBackClick = () => {
        if (activeSection === 'media') updateSection('basic');
        if (activeSection === 'pricing') updateSection('media');
    };
    
    const handleContinueClick = () => {
        if (activeSection === 'basic') {
            if (isBasicSectionComplete()) {
                updateSection('media');
            } else {
                toast({
                    title: 'Thông tin chưa đầy đủ',
                    description: 'Vui lòng điền đầy đủ thông tin trong phần thông tin cơ bản',
                    variant: 'destructive',
                });
            }
        }
        
        if (activeSection === 'media') {
            if (isMediaSectionComplete()) {
                updateSection('pricing');
            } else {
                toast({
                    title: 'Thông tin chưa đầy đủ',
                    description: 'Vui lòng upload ảnh thumbnail cho khóa học',
                    variant: 'destructive',
                });
            }
        }
    };
    
    const handleThumbnailRemove = () => {
        setPreviewThumbnail(null);
        setCourseData({...courseData, thumbnail: null});
    };
    
    // Submit form to update course
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate all sections
        if (!isBasicSectionComplete()) {
            updateSection('basic');
            toast({
                title: 'Thông tin chưa đầy đủ',
                description: 'Vui lòng điền đầy đủ thông tin trong phần thông tin cơ bản',
                variant: 'destructive',
            });
            return;
        }
        
        if (!isMediaSectionComplete()) {
            updateSection('media');
            toast({
                title: 'Thông tin chưa đầy đủ',
                description: 'Vui lòng upload ảnh thumbnail cho khóa học',
                variant: 'destructive',
            });
            return;
        }
        
        if (!isPriceSectionComplete()) {
            updateSection('pricing');
            toast({
                title: 'Thông tin chưa đầy đủ',
                description: 'Vui lòng chọn giá cho khóa học đúng quy định',
                variant: 'destructive',
            });
            return;
        }
        
        setSubmitting(true);
        try {
            // Get category ID from slug
            let categoryId: number | undefined;
            if (courseData.category) {
                try {
                    // Ensure category is treated as a numeric ID
                    const categoryIdNum = parseInt(courseData.category);
                    if (!isNaN(categoryIdNum)) {
                        categoryId = categoryIdNum;
                    }
                } catch (error) {
                    console.error('Error parsing category ID:', error);
                }
            }
            
            // Prepare course request
            const courseRequest: CourseRequest = {
                name: courseData.title,
                description: courseData.description || '',
                price: courseData.price ?? 0, // Handle null price by defaulting to 0
                level: courseData.level as any,
                language: courseData.language,
                categorySlug: courseData.category,
                image: previewThumbnail ? previewThumbnail : undefined,
                slug: courseData.slug,
            };
            
            // Upload new thumbnail if changed
            if (courseData.thumbnail) {
                const uploadedImage = await uploadImage(courseData.thumbnail);
                if (uploadedImage) {
                    courseRequest.image = uploadedImage.id;
                }
            }
            
            // Update the course
            const updatedCourse = await updateCourse(courseId, courseRequest);
            
            if (updatedCourse) {
                toast({
                    title: 'Cập nhật thành công',
                    description: 'Thông tin khóa học đã được cập nhật',
                    variant: 'default',
                });
                
                // Navigate back to courses page
                router.push('/instructor/courses');
            } else {
                throw new Error('Failed to update course');
            }
            
        } catch (error) {
            console.error('Error updating course:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể cập nhật khóa học. Vui lòng thử lại sau.',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Add deleteCourse handler
    const handleDeleteCourse = async () => {
        try {
            const result = await deleteCourse(courseData.slug);
            if (result) {
                toast({
                    title: 'Xóa thành công',
                    description: 'Khóa học đã được xóa thành công',
                    variant: 'default',
                });
                
                router.push('/instructor/courses');
            } else {
                throw new Error('Failed to delete course');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể xóa khóa học. Vui lòng thử lại sau.',
                variant: 'destructive',
            });
        }
    };

    // Add submit for review handler
    const handleSubmitForReview = async () => {
        try {
            if (!courseId) {
                throw new Error('Course ID is missing');
            }
            
            const result = await submitCourseForReview(courseId);
            
            if (result) {
                toast({
                    title: 'Thành công',
                    description: 'Khóa học đã được gửi đi phê duyệt',
                    variant: 'default',
                });
                
                // Refresh course data to update status
                const slug = await getCourseSlugById(courseId);
                if (slug) {
                    const updatedCourse = await getCourseBySlug(slug);
                    if (updatedCourse) {
                        setCourse(updatedCourse);
                    }
                }
                
                // Navigate back to courses page
                router.push('/instructor/courses');
            } else {
                throw new Error('Failed to submit course for review');
            }
        } catch (error) {
            console.error('Error submitting course for review:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể gửi khóa học đi phê duyệt. Vui lòng thử lại sau.',
                variant: 'destructive',
            });
        }
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Đang tải thông tin khóa học...</h3>
                </div>
            </div>
        );
    }
    
    return (
        <div className="py-6 bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <CourseFormHeader 
                    progress={progress} 
                    isEditing={true}
                    courseId={courseId}
                    courseStatus={course?.status}
                    onDeleteCourse={handleDeleteCourse}
                    onSubmitForReview={handleSubmitForReview}
                />
                
                <Card className="overflow-hidden mb-6 border-0 shadow-lg rounded-xl">
                    <CourseFormNavigation
                        activeSection={activeSection}
                        onSectionChange={updateSection}
                        isBasicSectionComplete={isBasicSectionComplete()}
                        isMediaSectionComplete={isMediaSectionComplete()}
                        isPriceSectionComplete={isPriceSectionComplete()}
                    />
                    
                    {/* Auto-save indicator */}
                    <div className="px-6 py-2 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-end text-sm text-gray-500">
                            {formSaving ? (
                                <div className="flex items-center">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    <span>Đang lưu...</span>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    <span>Đã lưu tự động</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <CardContent className="p-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {activeSection === 'basic' && (
                                    <BasicInfoSection
                                        courseData={courseData}
                                        onChange={handleInputChange}
                                        onEditorChange={onEditorChange}
                                    />
                                )}
                                
                                {activeSection === 'media' && (
                                    <MediaSection
                                        courseData={courseData}
                                        previewThumbnail={previewThumbnail}
                                        onFileChange={handleFileChange}
                                        onThumbnailRemove={handleThumbnailRemove}
                                    />
                                )}
                                
                                {activeSection === 'pricing' && (
                                    <PricingSection
                                        courseData={courseData}
                                        onNumberChange={handleNumberChange}
                                        onInputChange={handleInputChange}
                                        onCheckboxChange={handleCheckboxChange}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </CardContent>
                    
                    <FormFooter
                        activeSection={activeSection}
                        onBack={handleBackClick}
                        onContinue={handleContinueClick}
                        onSubmit={handleSubmit}
                        isSubmitting={submitting}
                        isEditing={true}
                    />
                </Card>
                
                <div className="flex justify-center">
                    <div className="text-center text-sm text-gray-500 mt-6 bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-100">
                        <p>
                            Bạn cần trợ giúp? <a href="#" className="text-blue-600 font-medium hover:text-blue-800 transition-colors">Truy cập trung tâm hỗ
                            trợ</a> hoặc{" "}
                            <a href="#" className="text-blue-600 font-medium hover:text-blue-800 transition-colors">liên hệ với chúng tôi</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}