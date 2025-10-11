'use client';

import apiClient from "@/lib/apiClient";
import {CategoryDto, CategoryRequest} from "@/types/category";
import {AxiosResponse} from "axios";
import {API_ENDPOINTS} from "@/config/api.endpoint";

// 🔍 GET /categories
export async function getCategories(): Promise<CategoryDto[]> {
    try {
        const response: AxiosResponse = await apiClient.get(API_ENDPOINTS.CATEGORY.LIST);
        return response.data.data;
    } catch (error) {
        console.error("getCategories error:", error);
        return [];
    }
}

// 🔍 GET /categories/{slug}
export async function getCategory(slug: string): Promise<CategoryDto | null> {
    try {
        const response: AxiosResponse = await apiClient.get(API_ENDPOINTS.CATEGORY.BY_SLUG(slug));
        return response.data.data;
    } catch (error) {
        console.error("getCategory error:", error);
        return null;
    }
}

// ➕ POST /categories
export async function createCategory(request: CategoryRequest): Promise<CategoryDto | null> {
    try {
        const response: AxiosResponse = await apiClient.post(API_ENDPOINTS.CATEGORY.CREATE, request);
        return response.data.data;
    } catch (error) {
        console.error("createCategory error:", error);
        return null;
    }
}

// ✏️ PUT /categories/{slug}
export async function updateCategory(slug: string, request: CategoryRequest): Promise<CategoryDto | null> {
    try {
        const response: AxiosResponse = await apiClient.put(API_ENDPOINTS.CATEGORY.UPDATE(slug), request);
        return response.data.data;
    } catch (error) {
        console.error("updateCategory error:", error);
        return null;
    }
}

// ❌ DELETE /categories/{slug}
export async function deleteCategory(slug: string): Promise<boolean> {
    try {
        await apiClient.delete(API_ENDPOINTS.CATEGORY.DELETE(slug));
        return true;
    } catch (error) {
        console.error("deleteCategory error:", error);
        return false;
    }
}
