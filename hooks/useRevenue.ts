'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWalletBalance,
  getWalletTransactions,
  getRevenueHistory,
  createPayoutRequest,
  getPayoutRequests,
  cancelPayoutRequest,
  getRevenueDashboard,
  getPendingPayouts,
  approvePayoutRequest,
  processRefund
} from '@/services/revenueService';
import {
  PayoutRequestDto,
  PayoutApprovalRequest,
  RefundRequest,
  WalletTransactionType
} from '@/types/revenue';

// ==================== INSTRUCTOR HOOKS ====================

/**
 * Hook to get instructor wallet balance
 */
export const useWalletBalance = () => {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: getWalletBalance,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get wallet transactions with pagination and filtering
 */
export const useWalletTransactions = (
  page = 0,
  size = 10,
  type?: WalletTransactionType
) => {
  return useQuery({
    queryKey: ['wallet', 'transactions', page, size, type],
    queryFn: () => getWalletTransactions(page, size, type),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to get revenue history with pagination
 */
export const useRevenueHistory = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['revenue', 'history', page, size],
    queryFn: () => getRevenueHistory(page, size),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to get instructor's payout requests
 */
export const usePayoutRequests = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['payout', 'requests', page, size],
    queryFn: () => getPayoutRequests(page, size),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to create a new payout request
 */
export const useCreatePayoutRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payoutData: PayoutRequestDto) => createPayoutRequest(payoutData),
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['payout', 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
    },
  });
};

/**
 * Hook to cancel a payout request
 */
export const useCancelPayoutRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: number) => cancelPayoutRequest(requestId),
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['payout', 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
    },
  });
};

// ==================== ADMIN HOOKS ====================

/**
 * Hook to get revenue dashboard statistics
 */
export const useRevenueDashboard = () => {
  return useQuery({
    queryKey: ['admin', 'revenue', 'dashboard'],
    queryFn: getRevenueDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get pending payout requests for admin review
 */
export const usePendingPayouts = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['admin', 'payout', 'pending', page, size],
    queryFn: () => getPendingPayouts(page, size),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to approve or reject payout requests
 */
export const useApprovePayoutRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (approvalData: PayoutApprovalRequest) => approvePayoutRequest(approvalData),
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin', 'payout', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'revenue', 'dashboard'] });
    },
  });
};

/**
 * Hook to process refunds
 */
export const useProcessRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (refundData: RefundRequest) => processRefund(refundData),
    onSuccess: () => {
      // Invalidate dashboard to refresh statistics
      queryClient.invalidateQueries({ queryKey: ['admin', 'revenue', 'dashboard'] });
    },
  });
};

// ==================== UTILITY HOOKS ====================

/**
 * Hook to refresh all revenue-related queries
 */
export const useRefreshRevenueData = () => {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
    queryClient.invalidateQueries({ queryKey: ['revenue'] });
    queryClient.invalidateQueries({ queryKey: ['payout'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'revenue'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'payout'] });
  };

  return { refreshAll };
};
