// NoResultsFound.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function NoResultsFound() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const aiSearchEnabled = searchParams.get('ai') === 'true';

    const toggleAiSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (aiSearchEnabled) {
            params.set('ai', 'false');
        } else {
            params.set('ai', 'true');
            // Remove sort params when enabling AI
            params.delete('sortBy');
            params.delete('sortDirection');
        }
        
        params.set('page', '1');
        router.push(`/courses/search?${params.toString()}`);
    };

    const clearAllFilters = () => {
        const query = searchParams.get('q');
        if (query) {
            router.push(`/courses/search?q=${query}&page=1`);
        } else {
            router.push('/courses/search?page=1');
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg text-center">
            <p className="text-xl text-gray-600 mb-4">Không tìm thấy khóa học phù hợp</p>
            <p className="text-gray-500 mb-6">Vui lòng thử từ khóa khác hoặc điều chỉnh bộ lọc</p>
            <div className="flex justify-center gap-3">
                <Button onClick={clearAllFilters} variant="outline">
                    Xóa bộ lọc
                </Button>
                <Button 
                    onClick={toggleAiSearch} 
                    variant={aiSearchEnabled ? "outline" : "default"}
                    className={aiSearchEnabled ? "" : "bg-indigo-600 hover:bg-indigo-700"}
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {aiSearchEnabled ? "Tìm kiếm bình thường" : "Thử tìm kiếm bằng AI"}
                </Button>
            </div>
        </div>
    );
}