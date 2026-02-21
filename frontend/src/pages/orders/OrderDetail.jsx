import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import api from "../../services/api";

const formatRp = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Failed to load order", err);
        alert("Gagal memuat detail order");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  const handleUpdateStatus = async (newStatus) => {
    if (!window.confirm(`Ubah status order menjadi ${newStatus}?`)) return;

    setUpdating(true);
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
      alert(`Status berhasil diubah menjadi ${newStatus}`);
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Gagal update status: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Detail</h1>
        <Button variant="secondary" onClick={() => navigate("/orders")}>
          ← Back to Orders
        </Button>
      </div>

      {/* Order Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500">Order Number</div>
            <div className="text-lg font-semibold">{order.orderNumber}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <div className="text-lg">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === "completed" ? "bg-green-100 text-green-800" : order.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                {order.status === "completed" ? "✅ Completed" : order.status === "cancelled" ? "❌ Cancelled" : "⏳ Pending"}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Customer</div>
            <div className="text-base">{order.customerName || "-"}</div>
            {order.customerPhone && <div className="text-sm text-gray-600">{order.customerPhone}</div>}
          </div>
          <div>
            <div className="text-sm text-gray-500">Date</div>
            <div className="text-base">{new Date(order.createdAt).toLocaleString("id-ID")}</div>
          </div>
        </div>

        {order.notes && (
          <div className="border-t pt-4 mt-4">
            <div className="text-sm text-gray-500 mb-1">Notes</div>
            <div className="text-base">{order.notes}</div>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {order.items?.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3">{item.productName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.productSku}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatRp(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatRp(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2">
              <tr>
                <td colSpan="4" className="px-4 py-3 text-right font-semibold">
                  Total
                </td>
                <td className="px-4 py-3 text-right font-bold text-lg">{formatRp(order.totalAmount)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="px-4 py-3 text-right text-gray-600">
                  Est. Profit
                </td>
                <td className="px-4 py-3 text-right text-green-600 font-semibold">{formatRp(order.profit || 0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      {order.status === "pending" && (
        <div className="flex gap-4">
          <Button variant="primary" onClick={() => handleUpdateStatus("completed")} disabled={updating}>
            ✅ Mark as Completed
          </Button>
          <Button variant="danger" onClick={() => handleUpdateStatus("cancelled")} disabled={updating}>
            ❌ Cancel Order
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
