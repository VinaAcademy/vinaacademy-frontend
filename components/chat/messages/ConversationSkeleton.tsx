import {Skeleton} from "primereact/skeleton";

export default function ConversationSkeleton() {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] animate-in fade-in duration-300"> {/* Header skeleton */}
            <div className="border-b p-4 bg-gradient-to-r from-card via-card to-card/95">
                <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full"/> <Skeleton
                    className="h-12 w-12 rounded-full"/>
                    <div className="flex-1"><Skeleton className="h-5 w-40 mb-2"/> <Skeleton className="h-3 w-24"/></div>
                </div>
            </div>
            {/* Messages skeleton */}
            <div
                className="flex-1 p-4 space-y-4 bg-gradient-to-b from-background via-background to-muted/10"> {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full"/>
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4"/>
                        <Skeleton className="h-4 w-1/2"/>
                    </div>
                </div>
            ))} </div>
        </div>
    );
}