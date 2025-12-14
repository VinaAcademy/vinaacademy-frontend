  "use client";

  import { useState, useEffect, useCallback } from "react";
  import Image from "next/image";
  import {
    ChevronDown,
    ChevronUp,
    LucideLoader2,
    ShoppingBag,
    CreditCard,
    Eye,
    X,
  } from "lucide-react";
  import { OrderDto, OrderStatus, PaymentStatus } from "@/types/payment-type";

  // Import the API function
  import { getOrders, getOrderDetail } from "@/services/paymentService";
  import OrderPagination from "@/components/student/profile/payments/pagination";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";

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

    // State for order detail modal
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailOrder, setDetailOrder] = useState<OrderDto | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

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

    // Handle view order detail
    const handleViewDetail = async (orderId: string) => {
      setDetailLoading(true);
      try {
        const data = await getOrderDetail(orderId);
        setDetailOrder(data);
        setDetailOpen(true);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết đơn hàng:", error);
      } finally {
        setDetailLoading(false);
      }
    };

    // Fetch orders from API
    const fetchOrders = useCallback(async () => {
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
    }, [page, sortBy, sortDir, pageTransition]);

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
                      <div className="flex gap-2 items-center justify-center flex-wrap">
                        <button
                          onClick={() => handleViewDetail(order.id)}
                          className="bg-slate-600 hover:bg-slate-700 text-white text-xs px-2 py-1 rounded transition-colors flex items-center"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Chi tiết
                        </button>
                        {order.paymentDto &&
                        order.paymentDto.paymentStatus === "PENDING" &&
                        isWithin15Minutes(order.createdDate) ? (
                          <button
                            onClick={() => handleContinuePayment(order.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors flex items-center"
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            Thanh toán
                          </button>
                        ) : (
                          <button className="bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-50 cursor-not-allowed flex items-center">
                            <CreditCard className="h-3 w-3 mr-1" />
                            Thanh toán
                          </button>
                        )}
                      </div>
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

        {/* Order Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết đơn hàng #{detailOrder?.id}</DialogTitle>
              <DialogDescription>
                Xem danh sách khóa học trong đơn hàng
              </DialogDescription>
            </DialogHeader>

            {detailLoading ? (
              <div className="flex justify-center items-center h-32">
                <LucideLoader2 className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : detailOrder && detailOrder.orderItemsDto && detailOrder.orderItemsDto.length > 0 ? (
              <div className="space-y-4">
                {/* Order Summary */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-600">Mã đơn hàng</p>
                    <p className="font-semibold">#{detailOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái</p>
                    <StatusBadge status={detailOrder.status} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tổng tiền</p>
                    <p className="font-semibold text-lg">
                      {formatCurrency(detailOrder.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày tạo</p>
                    <p className="font-semibold">
                      {formatDate(detailOrder.createdDate)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3">Khóa học trong đơn</h4>
                  <div className="space-y-3">
                    {detailOrder.orderItemsDto.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {/* Course Image */}
                        {item.url_image && (
                          <Image
                            src={item.url_image}
                            alt={item.course_name}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}

                        {/* Course Info */}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.course_name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            ID: {item.course_id}
                          </p>
                          <p className="text-lg font-semibold text-indigo-600 mt-2">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Section */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng phụ</span>
                    <span className="font-medium">
                      {formatCurrency(detailOrder.subTotal)}
                    </span>
                  </div>
                  {detailOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span className="font-medium">
                        -{formatCurrency(detailOrder.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Tổng cộng</span>
                    <span>{formatCurrency(detailOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-500">Không có dữ liệu</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }
