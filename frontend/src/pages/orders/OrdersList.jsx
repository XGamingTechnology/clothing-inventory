import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import api from "../../services/api";

// Format currency IDR
const formatRp = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.append("status", statusFilter);

        const res = await api.get(`/orders?${params.toString()}`);

        // ✅ Debug: cek struktur data dari backend
        console.log(
          "Orders loaded:",
          res.data.slice(0, 1).map((o) => ({
            id: o.id,
            idType: typeof o.id,
            createdAt: o.createdAt,
            created_at: o.created_at,
            items: o.items?.length,
          }))
        );

        setOrders(res.data);
      } catch (err) {
        console.error("Failed to load orders", err);
        setError("Gagal memuat data order. Pastikan backend berjalan.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  // Filter orders by search term (client-side)
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Cancel order handler - ✅ Pastikan ID dikirim sebagai number
  const handleCancel = async (orderId, orderNumber) => {
    if (!window.confirm(`Yakin ingin membatalkan order ${orderNumber}?`)) return;

    try {
      // ✅ Pastikan endpoint ini ada di backend: POST /orders/:id/cancel
      await api.post(`/orders/${Number(orderId)}/cancel`);
      setOrders((prev) =>
        prev.map((o) =>
          // ✅ Compare dengan Number untuk aman
          Number(o.id) === Number(orderId) ? { ...o, status: "cancelled" } : o
        )
      );
    } catch (err) {
      console.error("Cancel error:", err.response?.data);
      alert("Gagal membatalkan order: " + (err.response?.data?.message || err.message));
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const styles = {
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    const labels = {
      completed: "✅ Completed",
      cancelled: "❌ Cancelled",
      pending: "⏳ Pending",
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>{labels[status] || status}</span>;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="py-6 flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Memuat orders...</span>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <Link to="/orders/new">
          <Button variant="primary">+ Create Order</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Search by order # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="w-full sm:w-48">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="all">All Status</option>
            <option value="pending">⏳ Pending</option>
            <option value="completed">✅ Completed</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ❌ {error}
          <button onClick={() => window.location.reload()} className="ml-2 underline hover:text-red-900">
            Retry
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-3">📦</div>
            <p className="text-gray-500 mb-4">{searchTerm || statusFilter !== "all" ? "Tidak ada order yang sesuai filter." : "Belum ada order."}</p>
            {!searchTerm && statusFilter === "all" && (
              <Link to="/orders/new">
                <Button variant="primary">Buat Order Pertama</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-semibold text-indigo-600">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.customerName || "-"}
                      {order.customerPhone && <div className="text-xs text-gray-500">{order.customerPhone}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.items?.length || 0} item(s)</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatRp(order.totalAmount)}</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">{formatRp(order.profit || 0)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {/* ✅ FIX: Gunakan createdAt (camelCase), bukan created_at */}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      {/* ✅ FIX: Pastikan ID number untuk routing */}
                      <Link to={`/orders/${Number(order.id)}`}>
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </Link>
                      {order.status === "pending" && (
                        <Button variant="danger" size="sm" onClick={() => handleCancel(order.id, order.orderNumber)}>
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredOrders.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Orders</div>
            <div className="text-2xl font-bold text-gray-900">{filteredOrders.length}</div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="text-2xl font-bold text-indigo-600">
              {formatRp(
                filteredOrders.reduce((sum, o) => {
                  // ✅ FIX: Pastikan number & handle undefined
                  const amount = parseFloat(o.totalAmount) || 0;
                  return sum + amount;
                }, 0)
              )}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Profit</div>
            <div className="text-2xl font-bold text-green-600">
              {formatRp(
                filteredOrders.reduce((sum, o) => {
                  // ✅ FIX: Pastikan number & handle undefined
                  const profit = parseFloat(o.profit) || 0;
                  return sum + profit;
                }, 0)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;
