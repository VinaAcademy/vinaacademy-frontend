import {ArrowLeft} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useRouter} from 'next/navigation';

export default function ConversationNotFound() {
    const router = useRouter();
    return (
        <div
            className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4 animate-in fade-in zoom-in duration-500">
            <div className="text-center max-w-md">
                <div
                    className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-full p-8 mb-6 mx-auto w-fit shadow-lg">
                    <ArrowLeft className="h-16 w-16 text-red-500 dark:text-red-400"/></div>
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"> Không
                    tìm thấy cuộc trò chuyện </h2> <p className="text-muted-foreground mb-6"> Cuộc trò chuyện này có thể
                đã bị xóa hoặc bạn không có quyền truy cập vào nó. </p> <Button
                onClick={() => router.push('/conversations')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <ArrowLeft className="h-4 w-4 mr-2"/> Quay lại danh sách </Button></div>
        </div>
    );
}