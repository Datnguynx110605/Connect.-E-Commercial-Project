import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { DollarSign, TrendingUp, ShoppingBag, Users, Package, Tags, Ticket, Loader2 } from 'lucide-react';
import { getAllOrders, getAllUsers, getAllProducts, getAllCategories, getAllCoupons } from '../api';

export function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    profit: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalCoupons: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [orders, users, products, categories, coupons] = await Promise.all([
          getAllOrders(),
          getAllUsers(),
          getAllProducts(),
          getAllCategories(),
          getAllCoupons()
        ]);

        const totalRevenue = orders.reduce((acc, order) => acc + order.orderFinalPrice, 0);
        // Assuming 30% profit margin as a mock calculation if not provided by API
        const totalProfit = totalRevenue * 0.3;

        setStats({
          revenue: totalRevenue,
          profit: totalProfit,
          totalOrders: orders.length,
          totalUsers: users.length,
          totalProducts: products.length,
          totalCategories: categories.length,
          totalCoupons: coupons.length
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = [
    { label: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Total Profit', value: `$${stats.profit.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  const secondaryStats = [
    { label: 'Products', value: stats.totalProducts, icon: Package },
    { label: 'Categories', value: stats.totalCategories, icon: Tags },
    { label: 'Active Coupons', value: stats.totalCoupons, icon: Ticket },
  ];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Revenue Insights" />
          <CardContent>
            <div className="h-80 w-full flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
               <p className="text-gray-400 text-sm">Real-time chart data aggregation coming soon...</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Inventory Overview" />
            <CardContent className="space-y-6">
              {secondaryStats.map((stat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-700">{stat.label}</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
