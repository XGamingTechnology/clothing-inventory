import React, { useState, useEffect } from "react";
import api from "../../services/api"; // ✅ Hanya sekali!
import Button from "../../components/ui/Button";

const formatRp = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

// ... rest of component

const FinancialReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default 30 hari terakhir
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      // ✅ FIX: Tambah waktu ke endDate
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // ✅ Set ke akhir hari

      const res = await api.get(`/orders/reports/financial?startDate=${start.toISOString()}&endDate=${end.toISOString()}`);
      console.log("📊 Financial Report Data:", res.data);
      setReport(res.data);
    } catch (err) {
      console.error("Failed to load report", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">📊 Laporan Keuangan</h1>

      {/* Date Filter */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <Button variant="primary" onClick={fetchReport}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-sm text-gray-500 mb-1">Total Pendapatan</div>
              <div className="text-2xl font-bold text-indigo-600">{formatRp(report.summary.totalRevenue)}</div>
              <div className="text-xs text-gray-400 mt-1">Revenue Kotor</div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-sm text-gray-500 mb-1">Total Profit</div>
              <div className="text-2xl font-bold text-green-600">{formatRp(report.summary.totalProfit)}</div>
              <div className="text-xs text-gray-400 mt-1">Margin: {report.summary.profitMargin.toFixed(1)}%</div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-sm text-gray-500 mb-1">Total Pesanan</div>
              <div className="text-2xl font-bold text-gray-900">{report.summary.totalOrders}</div>
              <div className="text-xs text-gray-400 mt-1">Order Completed</div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-sm text-gray-500 mb-1">Rata-rata per Order</div>
              <div className="text-2xl font-bold text-blue-600">{formatRp(report.summary.avgOrderValue)}</div>
              <div className="text-xs text-gray-400 mt-1">Average Order Value</div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">🏆 10 Produk Terlaris</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Terjual</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.topProducts.map((product, index) => (
                    <tr key={product.productId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            index === 0 ? "bg-yellow-100 text-yellow-700" : index === 1 ? "bg-gray-100 text-gray-700" : index === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{product.productName}</td>
                      <td className="px-4 py-3 text-right">{product.quantitySold} pcs</td>
                      <td className="px-4 py-3 text-right font-medium">{formatRp(product.revenue)}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">{formatRp(product.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue Trend (Simple Table) */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">📈 Trend Pendapatan Harian</h2>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.revenueByDay
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((day) => {
                      const dayOrders = report.summary.totalOrders / report.revenueByDay.length;
                      return (
                        <tr key={day.date} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {new Date(day.date).toLocaleDateString("id-ID", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{formatRp(day.revenue)}</td>
                          <td className="px-4 py-3 text-right text-gray-600">~{Math.round(dayOrders)} orders</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialReport;
