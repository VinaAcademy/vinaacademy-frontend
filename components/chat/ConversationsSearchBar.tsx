import {Search, Users, MessageSquare} from "lucide-react";
import {Input} from "@/components/ui/input";
import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type SearchType = "conversation" | "user";

type ConversationsSearchBarProps = {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchType: SearchType;
    setSearchType: (type: SearchType) => void;
}

export default function ConversationsSearchBar({
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
}: ConversationsSearchBarProps) {
    return (
        <div className="mb-6 space-y-3">
            {/* Filter Tabs */}
            <div className="flex gap-2">
                <Select value={searchType} onValueChange={(value: SearchType) => setSearchType(value)}>
                    <SelectTrigger className="w-40 h-10 rounded-xl border-gray-200 hover:border-cyan-500 transition-colors">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="conversation">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4"/>
                                <span>Cuộc trò chuyện</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="user">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4"/>
                                <span>Người dùng</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Search Input */}
            <div className="relative group">
                <div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-sky-500 rounded-xl blur-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative">
                    <Search
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-cyan-600 transition-colors duration-300"/>
                    <Input
                        type="text"
                        placeholder={
                            searchType === "conversation"
                                ? "Tìm kiếm cuộc trò chuyện..."
                                : "Tìm kiếm người dùng..."
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 h-11 text-sm rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all duration-300 shadow-sm hover:shadow-md bg-white/80 backdrop-blur-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <span className="text-lg">×</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}