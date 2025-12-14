import apiClient from "@/lib/apiClient";
import { PaginatedResponse } from "@/types/api-response";
import {
  CouponDto,
  OrderCouponRequest,
  OrderDto,
  PaymentDto,
  PaymentMethod,
  PaymentStatus,
} from "@/types/payment-type";
import { AxiosResponse } from "axios";

export async function createOrder(): Promise<OrderDto | null> {
  try {
    const response: AxiosResponse = await apiClient.post("/order");
    return response.data.data;
  } catch (error) {
    console.error("Create order error:", error);
    return null;
  }
}

export async function applyCouponToOrder(
  orderCouponRequest: OrderCouponRequest
): Promise<OrderDto | null> {
  try {
    const response: AxiosResponse = await apiClient.put(
      `/order/coupon`,
      orderCouponRequest
    );
    return response.data.data;
  } catch (error) {
    console.error("Apply coupon error:", error);
    return null;
  }
}

export async function createPayment(
  orderId: string
): Promise<PaymentDto | null> {
  try {
    const response: AxiosResponse = await apiClient.post(`/payment/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error("Create payment error:", error);
    return null;
  }
}

export async function validateUrlReturn(
  params: Record<string, string>
): Promise<PaymentStatus | null> {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response: AxiosResponse = await apiClient.get(
      `/payment/valid?${queryString}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Validate url return error:", error);
    return null;
  }
}

export async function getValidCoupons(): Promise<CouponDto[]> {
  try {
    const response: AxiosResponse = await apiClient.get("/coupon/list");
    return response.data.data;
  } catch (error) {
    console.error("Get valid coupons error:", error);
    return [];
  }
}

export async function getOrders({
  page = 0,
  size = 10,
  sortBy = "createdDate",
  sortDir = "desc",
}): Promise<PaginatedResponse<OrderDto> | null> {
  try {
    const response: AxiosResponse = await apiClient.get("/order/list", {
      params: {
        page,
        size,
        sortBy,
        sortDir,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Get orders error:", error);
    return null;
  }
}

export async function getOrderDetail(orderId: string): Promise<OrderDto | null> {
  try {
    const response: AxiosResponse = await apiClient.get(`/order/detail/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error("Get order detail error:", error);
    return null;
  }
}
