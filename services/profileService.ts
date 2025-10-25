import apiClient from "@/lib/apiClient";
import {User, ViewUser} from "@/types/auth";
import {ChangePasswordRequest, UpdateUserInfoRequest} from "@/types/profile-type";
import {AxiosResponse} from "axios";
import {API_ENDPOINTS} from "@/config/api.endpoint";
import {PaginatedResponse} from "@/types/api-response";


export const changePassword = async (changePasswordRequest: ChangePasswordRequest): Promise<Boolean | null> => {
    try {
        const response: AxiosResponse = await apiClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, changePasswordRequest);
        return response.data.data;
    } catch (error) {
        console.error("changePassword error:", error);
        return false;
    }
};

export const updateUserInfo = async (updateUserInfoRequest: UpdateUserInfoRequest): Promise<User | null> => {
    try {
        const response: AxiosResponse = await apiClient.put(API_ENDPOINTS.USER.UPDATE_INFO, updateUserInfoRequest);

        return response.data.data;
    } catch (error) {
        console.error("updateUserInfo error:", error);
        return null;
    }
};

export const getViewUserInfo = async (userId: string): Promise<ViewUser | null> => {
    try {
        const response: AxiosResponse = await apiClient.get(API_ENDPOINTS.USER.VIEW(userId));

        return response.data.data;
    } catch (error) {
        console.error("get View User Info error:", error);
        return null;
    }
};

export const searchUsers = async (keyword: string): Promise<PaginatedResponse<User> | null> => {
    try {
        const response: AxiosResponse = await apiClient.get(API_ENDPOINTS.USER.SEARCH, {
            params: {
                keyword: keyword
            }
        });

        return response.data.data;
    } catch (error) {
        console.error("searchUsers error:", error);
        return null;
    }
};