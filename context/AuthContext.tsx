'use client';

import React, {createContext, useContext, useEffect, useState} from "react";
import {AuthContextType, LoginCredentials, RegisterRequest, User} from "@/types/auth";
import {usePathname, useRouter} from "next/navigation";
import * as authService from "@/services/authService";
import {getAccessToken} from "@/lib/apiClient";
import {createErrorToast, createSuccessToast} from "@/components/ui/toast-cus";
import {useQueryClient} from "@tanstack/react-query";

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    login: async () => false,
    logout: async () => {
    },
    refreshAuth: async () => false,
    register: async () => false,
    resendVerificationEmail: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                // Clear any previous errors
                setError(null);

                // Skip check if no user and no token
                if (!user && !getAccessToken()) {
                    return;
                }

                // Try to get current user first
                const currentUser = await authService.getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    return;
                }

                // If failed, try refresh token as fallback
                const refreshUser = await authService.refreshToken();
                setUser(refreshUser);
            } catch (error) {
                console.error("Error checking authentication:", error);
                setError("Không thể xác thực. Vui lòng thử lại.");
            } finally {
                setIsLoading(false);
            }
        }
        checkAuthentication().then(r => r);
    }, []);

    // Login function
    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        setIsLoading(true);
        try {
            const loggedInUser = await authService.login(credentials);
            if (loggedInUser) {
                setUser(loggedInUser);
                createSuccessToast(`Chào bạn, ${loggedInUser.fullName || loggedInUser.username || loggedInUser.email || 'user'}!`)

                return true;
            }
            return false;
        } catch (error) {

            createErrorToast('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin tài khoản.');
            console.error('Login failed:', error);

            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Register function
    const register = async (data: RegisterRequest): Promise<boolean> => {
        setIsLoading(true);
        try {
            const success = await authService.register(data);
            if (success) {
                createSuccessToast('Đăng ký thành công! Vui lòng đăng nhập với tài khoản mới của bạn.')
            }
            return success;
        } catch (error) {
            console.error('Registration failed:', error);

            createErrorToast('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin tài khoản.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Resend verification email function
    const resendVerificationEmail = async (email: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const success = await authService.resendVerificationEmail(email);
            if (success) {
                createSuccessToast('Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.');
            }
            return success;
        } catch (error) {
            console.error('Resend verification email failed:', error);
            createErrorToast('Không thể gửi lại email xác thực. Vui lòng thử lại sau.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const currentPath = usePathname();

    // Logout function
    const queryClient = useQueryClient();
    const logout = async () => {
        await authService.logout();
        setUser(null);
        // clear tanstack query
        queryClient.clear();
        createSuccessToast('Đăng xuất thành công!');
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    };

    // Refresh authentication function
    const refreshAuth = async (): Promise<boolean> => {
        setIsLoading(true);
        try {
            const refreshedUser = await authService.refreshToken();
            if (refreshedUser) {
                setUser(refreshedUser);
                return true;
            }
            setUser(null);
            return false;
        } catch (error) {
            console.error('Auth refresh failed:', error);
            setUser(null);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            error,
            login,
            logout,
            refreshAuth,
            register,
            resendVerificationEmail
        }}>
            {children}
        </AuthContext.Provider>
    )
}