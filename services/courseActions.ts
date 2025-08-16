// Server actions for course data
import { CourseDetailsResponse } from "@/types/course";

// This is a server action function that can be called from server components
export async function fetchCourseBySlug(slug: string): Promise<CourseDetailsResponse | null> {
    try {
        // Use node-fetch or native fetch in server environment
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/courses/by-slug/${slug}`);

        console.log(response);

        if (!response.ok) {
            console.error(`Failed to fetch course with slug ${slug}: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error(`Error fetching course with slug ${slug}:`, error);
        return null;
    }
}