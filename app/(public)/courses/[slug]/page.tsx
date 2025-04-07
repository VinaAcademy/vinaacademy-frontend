import CourseHeader from '@/components/courses/course-detail/CourseHeader';
import CourseDetails from '@/components/courses/course-detail/CourseDetails';
import ReviewsArea from '@/components/student/learning/learning-tab/ReviewArea';
import PurchaseCard from '@/components/courses/course-detail/PurchaseCard';
import { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { fetchCourseBySlug } from '@/services/courseActions';
import { CourseDetailsResponse } from '@/types/course';

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug?: string } }): Promise<Metadata> {
    const slug = params?.slug;
    if (!slug) {
        return {
            title: 'Khóa học | VinaAcademy',
            description: 'Khám phá các khóa học tại VinaAcademy'
        };
    }

    // Fetch course data from API using server action
    const course = await fetchCourseBySlug(slug);
    
    if (!course) {
        return {
            title: 'Không tìm thấy khóa học | VinaAcademy',
            description: 'Khóa học không tồn tại hoặc đã bị xóa'
        };
    }

    return {
        title: `${course.name} | VinaAcademy`,
        description: course.description,
        openGraph: {
            title: `${course.name} | VinaAcademy`,
            description: course.description,
            images: [{ url: course.image, alt: course.name }],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: course.name,
            description: course.description,
            images: [course.image],
        },
        alternates: {
            canonical: `https://vinaacademy.edu.vn/courses/${slug}`,
        }
    };
}

export default async function CoursePage({ params }: { params: { slug: string } }) {
    try {
        // Fetch course data from API using server action
        const course = await fetchCourseBySlug(params.slug);
        
        // If course not found, return 404
        if (!course) {
            return notFound();
        }

        // Create structured data for the course
        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: course.name,
            description: course.description,
            provider: {
                '@type': 'Organization',
                name: 'VinaAcademy',
                sameAs: 'https://vinaacademy.edu.vn'
            },
            offers: {
                '@type': 'Offer',
                price: course.price,
                priceCurrency: 'VND',
                availability: 'https://schema.org/InStock'
            },
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: course.rating,
                reviewCount: course.totalRating
            },
            inLanguage: course.language === 'Tiếng Việt' ? 'vi' : 'en',
            instructor: course.instructors.map(instructor => ({
                '@type': 'Person',
                name: instructor.fullName,
                description: instructor.description || '',
            })),
        };

        return (
            <>
                {/* JSON-LD Structured Data */}
                <Script
                    id="course-structured-data"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData)
                    }}
                />

                <div className="bg-white min-h-screen">
                    <main>
                        {/* Course Header Banner Section */}
                        <section className="bg-[#1c1d1f] text-white" aria-label="Thông tin khóa học">
                            <CourseHeader course={course}/>
                        </section>

                        {/* Main Content with Sidebar */}
                        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 relative">
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Main Content - 2/3 width on desktop */}
                                <article className="lg:w-2/3">
                                    <CourseDetails course={course}/>
                                    <section className="bg-white border rounded-lg p-6 mb-8">
                                        <ReviewsArea
                                            courseId={course.id}
                                            reviews={course.reviews}
                                            mainPage={true}
                                        />
                                    </section>
                                </article>

                                {/* Purchase Sidebar - 1/3 width, sticky on desktop, hidden on mobile */}
                                <aside className="lg:w-1/3 hidden lg:block">
                                    <div className="sticky top-24">
                                        <PurchaseCard 
                                            course={course} 
                                            instructors={course.instructors}
                                            sections={course.sections}
                                        />
                                    </div>
                                </aside>
                            </div>
                        </div>
                    </main>

                    {/* Mobile Purchase Bar - Fixed at bottom on mobile only */}
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4 z-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xl font-bold">{course.price.toLocaleString('vi-VN')}₫</p>
                            </div>
                            <button
                                className="bg-[#a435f0] hover:bg-[#8710d8] text-white py-3 px-6 rounded font-medium">
                                Đăng ký học ngay
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    } catch (error) {
        console.error("Error loading course:", error);
        return <div className="text-center text-xl text-red-500 p-10">Lỗi khi tải khóa học! Vui lòng thử lại sau.</div>;
    }
}
