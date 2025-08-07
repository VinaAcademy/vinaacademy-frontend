"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  LucideLoader2,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { OrderDto, OrderStatus, PaymentStatus } from "@/types/payment-type";

// Import the API function
import { getOrders } from "@/services/paymentService";
import OrderPagination from "@/components/student/profile/payments/pagination";

export default function OrderTable() {
  // State for orders and pagination
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // 1-based for this UI
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState("createdDate");
  const [sortDir, setSortDir] = useState("desc");
  const [pageTransition, setPageTransition] = useState(false);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Toggle sort direction
  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDir("desc");
    }
  };

  // Sort icon component
  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return null;
    }
    return sortDir === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4 inline" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4 inline" />
    );
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: OrderStatus }) => {
    const getStatusClasses = () => {
      switch (status) {
        case "PENDING":
          return "bg-amber-100 text-amber-800 border-amber-200";
        case "PAID":
          return "bg-emerald-100 text-emerald-800 border-emerald-200";
        case "CANCELLED":
          return "bg-rose-100 text-rose-800 border-rose-200";
        case "FAILED":
          return "bg-rose-100 text-rose-800 border-rose-200";
        default:
          return "bg-blue-100 text-blue-800 border-blue-200";
      }
    };

    const getStatusText = () => {
      switch (status) {
        case "PENDING":
          return "Đang chờ";
        case "PAID":
          return "Đã thanh toán";
        case "CANCELLED":
          return "Đã hủy";
        case "FAILED":
          return "Thất bại";
        default:
          return status;
      }
    };

    return (
      <span
        className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusClasses()}`}
      >
        {getStatusText()}
      </span>
    );
  };

  // Payment badge component
  const PaymentBadge = ({ order }: { order: OrderDto }) => {
    if (!order.paymentDto) {
      return <span className="text-sm text-gray-500">Không có</span>;
    }

    const getPaymentStatusClasses = () => {
      switch (order.paymentDto.paymentStatus) {
        case "COMPLETED":
          return "bg-emerald-100 text-emerald-800";
        case "PENDING":
          return "bg-amber-100 text-amber-800";
        case "FAILED":
          return "bg-rose-100 text-rose-800";
        case "CANCELLED":
          return "bg-rose-100 text-rose-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const getPaymentStatusText = () => {
      switch (order.paymentDto.paymentStatus) {
        case "COMPLETED":
          return "Thanh toán thành công";
        case "PENDING":
          return "Đang chờ thanh toán";
        case "FAILED":
          return "Thanh toán thất bại";
        case "CANCELLED":
          return "Đã hủy thanh toán";
        default:
          return order.paymentDto.paymentStatus;
      }
    };

    return (
      <span
        className={`px-2 py-1 text-sm font-medium rounded-full ${getPaymentStatusClasses()}`}
      >
        {getPaymentStatusText()}
      </span>
    );
  };

  // Check if the order was created within the last 15 minutes
  const isWithin15Minutes = (createdDate: string) => {
    const orderDate = new Date(createdDate);
    const currentDate = new Date();
    const diffInMs = currentDate.getTime() - orderDate.getTime();
    const diffInMinutes = diffInMs / (1000 * 60);
    return diffInMinutes < 15;
  };

  // Handle continue payment
  const handleContinuePayment = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    // If payment exists and has URL, navigate to it
    if (order?.paymentDto?.urlPayment) {
      window.location.href = order.paymentDto.urlPayment;
    } else {
      // Otherwise, you might need to create a new payment
      console.log("Creating new payment for order:", orderId);
      // Implement your payment initialization logic here
      // Example: initializePayment(orderId);
    }
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    if (!pageTransition) {
      setLoading(true);
    } else {
      setPageTransition(true);
    }

    try {
      // Adjust the page index, as backend uses 0-based indexing but UI uses 1-based
      const backendPage = page - 1;

      // Call the API with pagination and sorting parameters
      const data = await getOrders({
        page: backendPage,
        size: 8,
        sortBy: sortBy,
        sortDir: sortDir,
      });

      // Check if data is null or undefined
      if (!data || !data.content) {
        setOrders([]);
        setTotalPages(1);
        setTotalElements(0);
        return;
      }

      // Update state with API response
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      // Set empty state on error
      setOrders([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
      setPageTransition(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPageTransition(true);
    setPage(newPage);
  };

  // Effect to fetch orders when dependencies change
  useEffect(() => {
    fetchOrders();
  }, [page, sortBy, sortDir]);

  return (
    <div className="max-w-full max-h-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="px-5 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-6 w-6 text-indigo-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Đơn Hàng</h2>
            <p className="text-sm text-gray-600 mt-1">
              Quản lý đơn hàng của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-sm uppercase text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-medium tracking-wider">
                Mã đơn
              </th>
              <th
                className="px-4 py-3 text-left font-medium tracking-wider cursor-pointer"
                onClick={() => toggleSort("status")}
              >
                <div className="flex items-center">
                  Trạng thái <SortIcon column="status" />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-medium tracking-wider">
                Thanh toán
              </th>
              <th className="px-4 py-3 text-left font-medium tracking-wider">
                Tổng tiền
              </th>
              <th
                className="px-4 py-3 text-left font-medium tracking-wider cursor-pointer"
                onClick={() => toggleSort("createdDate")}
              >
                <div className="flex items-center">
                  Ngày tạo <SortIcon column="createdDate" />
                </div>
              </th>
              <th className="px-4 py-3 text-center font-medium tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody
            className={`relative divide-y divide-gray-200 transition-opacity duration-300 ${
              pageTransition ? "opacity-50" : "opacity-100"
            }`}
          >
            {loading && !pageTransition ? (
              <tr>
                <td colSpan={6} className="h-[425px] w-[1125px]">
                  <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-80 z-10">
                    <LucideLoader2 className="h-6 w-6 animate-spin text-indigo-500 mr-2" />
                    <span className="text-gray-500">Đang tải đơn hàng...</span>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-[425px] w-[1125px]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShoppingBag className="h-10 w-10 text-gray-300" />
                    <span className="text-gray-500">
                      Không tìm thấy dữ liệu
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <PaymentBadge order={order} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdDate)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                    {order.paymentDto &&
                    order.paymentDto.paymentStatus === "PENDING" &&
                    isWithin15Minutes(order.createdDate) ? (
                      <button
                        onClick={() => handleContinuePayment(order.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition-colors flex items-center mx-auto"
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Thanh toán
                      </button>
                    ) : (
                      <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition-colors flex items-center mx-auto hover:shadow-md opacity-50 cursor-not-allowed">
                        <CreditCard className="h-4 w-4 mr-1" />
                        Thanh toán
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
            {pageTransition && (
              <tr className="absolute inset-0 flex items-center justify-center">
                <td>
                  <div className="flex justify-center items-center h-16 w-16">
                    <LucideLoader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination */}
      <div className="px-5 py-4 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          {totalElements === 0
            ? "Không có đơn hàng nào"
            : `Hiển thị ${(page - 1) * 8 + 1} đến ${Math.min(
                page * 8,
                totalElements
              )} trong tổng số ${totalElements} đơn hàng`}
        </div>

        <OrderPagination
          totalPages={totalPages}
          currentPage={page}
          handlePageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
