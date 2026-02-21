import React, { useState, useEffect } from "react";
import { getProducts, getLowStockProducts } from "../../services/products";
import { getOrders } from "../../services/orders";
import { getFinancialReport } from "../../services/reports"; // ✅ Import baru
import Button from "../../components/ui/Button";

const formatRp = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    lowStock: 0,
  });

  // ✅ State untuk financial summary
  const [financialStats, setFinancialStats] = useState({
    revenue: 0,
    profit: 0,
    margin: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data dasar secara paralel
      const [productsData, ordersData, lowStockData] = await Promise.all([getProducts(), getOrders(), getLowStockProducts()]);

      setStats({
        products: productsData.length,
        orders: ordersData.length,
        lowStock: lowStockData.length,
      });

      // ✅ Fetch financial report (30 hari terakhir)
      try {
        const endDate = new Date().toISOString().split("T")[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        const report = await getFinancialReport(startDate, endDate);
        setFinancialStats({
          revenue: report.summary.totalRevenue,
          profit: report.summary.totalProfit,
          margin: report.summary.profitMargin,
        });
      } catch (err) {
        console.log("Financial report not available yet (backend might not have endpoint)");
        // Tidak throw error agar dashboard tetap bisa load
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      if (err.response?.status === 404) {
        setError("Some modules not yet implemented. Basic data loaded.");
      } else {
        setError("Failed to load dashboard data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const handleProductUpdated = () => fetchStats();
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

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview bisnis & inventori kamu</p>
        </div>
        <Button onClick={fetchStats} variant="outline" className="mt-4 sm:mt-0 flex items-center">
          🔄 Refresh Data
        </Button>
      </div>

      {/* Error Message */}
      {error && <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">⚠️ {error}</div>}

      {/* Stats Grid - Sekarang 4 Kolom */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Products Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition cursor-pointer" onClick={() => (window.location.href = "/products")}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8-4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-500">Products</h3>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.products}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Orders Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition cursor-pointer" onClick={() => (window.location.href = "/orders")}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-500">Orders</h3>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.orders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Low Stock Card */}
        <div
          className={`bg-white overflow-hidden shadow rounded-lg border ${stats.lowStock > 0 ? "border-red-300" : "border-gray-200"} hover:shadow-md transition cursor-pointer`}
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
                <h3 className="text-lg font-medium text-gray-500">Low Stock</h3>
                <p className={`mt-1 text-2xl font-bold ${stats.lowStock > 0 ? "text-red-600" : "text-gray-900"}`}>{stats.lowStock}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ 4. NEW: Financial Summary Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-indigo-200 hover:shadow-md transition cursor-pointer group" onClick={() => (window.location.href = "/reports/financial")}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-500">Revenue (30d)</h3>
                  <p className="mt-1 text-2xl font-bold text-indigo-600">{formatRp(financialStats.revenue)}</p>
                </div>
              </div>
              {/* Arrow indicator */}
              <svg className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Mini stats di bawah */}
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Profit</div>
                <div className="text-sm font-semibold text-green-600">{formatRp(financialStats.profit)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Margin</div>
                <div className="text-sm font-semibold text-gray-900">{financialStats.margin.toFixed(1)}%</div>
              </div>
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">Add Product</h3>
          </a>

          <a href="/orders/new" className="block bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Create Order</h3>
          </a>

          {/* ✅ NEW: Quick Access to Financial Report */}
          <a href="/reports/financial" className="block bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Financial Report</h3>
            <p className="mt-1 text-sm text-gray-500">View revenue & profit details</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
