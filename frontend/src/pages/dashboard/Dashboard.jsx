import React, { useState, useEffect } from "react";
import { getProducts, getLowStockProducts } from "../../services/products"; // ✅ Import benar
import { getOrders } from "../../services/orders"; // ✅ Import benar dari orders.js
import Button from "../../components/ui/Button";

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch semua data secara paralel
      const [productsData, ordersData, lowStockData] = await Promise.all([
        getProducts(),
        getOrders(), // ✅ Sekarang berfungsi karena import benar
        getLowStockProducts(),
      ]);

      setStats({
        products: productsData.length,
        orders: ordersData.length,
        lowStock: lowStockData.length,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);

      // ✅ Handle error jika orders API belum siap
      if (err.response?.status === 404) {
        setError("Orders module not yet implemented. Products data loaded successfully.");
      } else {
        setError(err.response?.data?.message || "Failed to load dashboard data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // ✅ AUTO-REFRESH saat ada perubahan produk
    const handleProductUpdated = () => {
      fetchStats();
    };

    window.addEventListener("productUpdated", handleProductUpdated);
    return () => window.removeEventListener("productUpdated", handleProductUpdated);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
        <Button onClick={fetchStats} variant="primary">
          Retry Loading Data
        </Button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to your Clothing Inventory System</p>
        </div>
        <Button onClick={fetchStats} variant="outline" className="mt-4 sm:mt-0 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Products Card - Klikable ke halaman products */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 transition-all hover:shadow-md cursor-pointer" onClick={() => (window.location.href = "/products")}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8-4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-500">Total Products</h3>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.products}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{stats.products === 0 ? "No products yet" : `${stats.products} active products`}</span>
            </div>
          </div>
        </div>

        {/* Orders Card - Klikable ke halaman orders */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 transition-all hover:shadow-md cursor-pointer" onClick={() => (window.location.href = "/orders")}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-500">Total Orders</h3>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.orders}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{stats.orders === 0 ? "No orders yet" : `${stats.orders} orders this month`}</span>
            </div>
          </div>
        </div>

        {/* Low Stock Card - Klikable ke halaman products dengan filter */}
        <div
          className={`bg-white overflow-hidden shadow rounded-lg border ${stats.lowStock > 0 ? "border-red-300" : "border-gray-200"} transition-all hover:shadow-md cursor-pointer`}
          onClick={() => (window.location.href = "/products?filter=low-stock")}
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stats.lowStock > 0 ? "bg-red-50" : "bg-gray-50"}`}>
                <svg className={`h-6 w-6 ${stats.lowStock > 0 ? "text-red-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-500">Low Stock Items</h3>
                <p className={`mt-1 text-3xl font-bold ${stats.lowStock > 0 ? "text-red-600" : "text-gray-900"}`}>{stats.lowStock}</p>
              </div>
            </div>
            <div className="mt-4">
              {stats.lowStock > 0 ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">⚠️ {stats.lowStock} items need restocking</span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✅ All stock levels healthy</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <a href="/products/new" className="block bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Add New Product</h3>
            <p className="mt-1 text-sm text-gray-500">Create a new product entry</p>
          </a>

          <a href="/orders/new" className="block bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Create Order</h3>
            <p className="mt-1 text-sm text-gray-500">Process a new customer order</p>
          </a>

          <a href="/stock/in" className="block bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Add Stock</h3>
            <p className="mt-1 text-sm text-gray-500">Record new stock arrivals</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
