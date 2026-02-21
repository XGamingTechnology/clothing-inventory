import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import api from "../../services/api";

const OrderForm = () => {
  const navigate = useNavigate();

  // State
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  // ✅ Init dengan null agar jelas bedanya "belum pilih" vs "pilih ID 0"
  const [items, setItems] = useState([{ productId: null, quantity: 1 }]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products?active=true");
        // ✅ Debug: cek type ID dari backend
        console.log(
          "Products loaded:",
          res.data.slice(0, 2).map((p) => ({
            id: p.id,
            type: typeof p.id,
            name: p.name,
          }))
        );

        const available = res.data.filter((p) => p.stock > 0);
        setProducts(available);
      } catch (err) {
        console.error("Failed to load products", err);
        setError("Gagal memuat daftar produk");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Tambah item baru
  const addItem = () => {
    setItems([...items, { productId: null, quantity: 1 }]);
  };

  // Update item - ✅ FIX: Convert ke Number untuk productId & quantity
  const updateItem = (index, field, value) => {
    const newItems = [...items];

    if (field === "productId") {
      // ✅ Convert string dari <select> ke number
      newItems[index] = {
        ...newItems[index],
        productId: value ? Number(value) : null,
        quantity: 1, // Reset quantity saat ganti produk
      };
    } else if (field === "quantity") {
      const qty = Math.max(1, parseInt(value) || 1);
      newItems[index] = { ...newItems[index], quantity: qty };
    }

    setItems(newItems);
  };

  // Hapus item
  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Hitung totals & profit - ✅ FIX: Casting ke Number untuk comparison & calculation
  const calculateSummary = () => {
    return items.reduce(
      (acc, item) => {
        // ✅ Casting ke Number agar comparison aman (number === number)
        const product = products.find((p) => p.id === Number(item.productId));

        if (product && item.quantity > 0) {
          // ✅ Pastikan semua operand adalah number
          const sellingPrice = Number(product.sellingPrice) || 0;
          const hpp = Number(product.hpp) || 0;
          const quantity = Number(item.quantity) || 0;

          const subtotal = sellingPrice * quantity;
          const cost = hpp * quantity;

          acc.total += subtotal;
          acc.cost += cost;
          acc.profit += subtotal - cost;
        }
        return acc;
      },
      { total: 0, cost: 0, profit: 0 }
    );
  };

  const { total, cost, profit } = calculateSummary();

  // Validasi form - ✅ FIX: Casting ke Number
  const validateForm = () => {
    for (const item of items) {
      if (!item.productId) return "Pilih produk untuk semua item";
      if (item.quantity < 1) return "Quantity minimal 1";

      // ✅ Casting ke Number untuk find product
      const product = products.find((p) => p.id === Number(item.productId));
      if (product && item.quantity > product.stock) {
        return `Stok ${product.name} tidak mencukupi (tersedia: ${product.stock})`;
      }
    }
    return null;
  };

  // Submit order - ✅ FIX: Convert ke Number di payload
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        notes: notes || undefined,
        items: items
          .filter((item) => item.productId)
          .map((item) => ({
            // ✅ Explicit convert ke number (backup untuk @Type di backend)
            productId: Number(item.productId),
            quantity: Number(item.quantity),
          })),
      };

      // ✅ Debug payload sebelum kirim
      console.log("Submitting payload:", JSON.stringify(payload, null, 2));

      const res = await api.post("/orders", payload);
      setSuccess(`✅ Order ${res.data.orderNumber} berhasil dibuat!`);

      // Reset form & redirect setelah sukses
      setTimeout(() => {
        navigate("/orders");
      }, 1500);
    } catch (err) {
      console.error("Order error:", err.response?.data || err.message);
      const msg = err.response?.data?.message || "Gagal membuat order";
      setError(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  // Format currency IDR
  const formatRp = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Loading state
  if (loadingProducts) {
    return (
      <div className="py-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Order</h1>

      {/* Alert Messages */}
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">❌ {error}</div>}
      {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">👤 Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Optional" />
            <Input label="Phone / WhatsApp" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Optional" type="tel" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for this order..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">📦 Order Items</h2>
            <Button type="button" variant="secondary" onClick={addItem}>
              + Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              // ✅ Casting ke Number untuk find product
              const product = products.find((p) => p.id === Number(item.productId));
              const isOverStock = product && item.quantity > product.stock;

              return (
                <div key={index} className={`flex flex-wrap gap-4 items-end p-4 border rounded-lg ${isOverStock ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
                  {/* Product Select */}
                  <div className="flex-1 min-w-[220px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product #{index + 1}</label>
                    <select
                      // ✅ value bisa number atau null, React handle otomatis
                      value={item.productId ?? ""}
                      onChange={(e) => updateItem(index, "productId", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) {p.size && `| ${p.size}`} {p.color && `| ${p.color}`} • Stock: {p.stock} • {formatRp(p.sellingPrice)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="w-28">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      max={product?.stock || 999}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* Subtotal & Profit Preview */}
                  {product && (
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{formatRp(product.sellingPrice * item.quantity)}</div>
                      <div className="text-xs text-gray-500">
                        Profit: <span className="text-green-600 font-medium">{formatRp((product.sellingPrice - product.hpp) * item.quantity)}</span>
                      </div>
                      {isOverStock && <div className="text-xs text-red-600 font-medium mt-1">⚠️ Melebihi stok tersedia!</div>}
                    </div>
                  )}

                  {/* Remove Button */}
                  <Button type="button" variant="danger" size="sm" onClick={() => removeItem(index)} disabled={items.length === 1}>
                    🗑️
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({items.filter((i) => i.productId).length} items)</span>
              <span>{formatRp(total)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Est. Cost (HPP)</span>
              <span>- {formatRp(cost)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold">
              <span>Est. Profit</span>
              <span className="text-green-600">{formatRp(profit)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button type="submit" variant="primary" disabled={submitting || items.some((i) => !i.productId)} className="min-w-[140px]">
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Processing...
              </span>
            ) : (
              "✅ Create Order"
            )}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/orders")} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
