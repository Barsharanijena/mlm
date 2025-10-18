import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/StatsCard";
import {
  Users,
  UserCircle,
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIInsightCard } from "@/components/AIInsightCard";
import type { DashboardStats, AIRecommendation, Sale, Product } from "@shared/schema";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: recentSales, isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales/recent"],
  });

  const { data: lowStock, isLoading: stockLoading } = useQuery<Product[]>({
    queryKey: ["/api/inventory/low-stock"],
  });

  const { data: aiRecommendations, isLoading: aiLoading } = useQuery<AIRecommendation[]>({
    queryKey: ["/api/ai/recommendations"],
  });

  const salesData = [
    { month: "Jan", sales: 45000, commissions: 4500 },
    { month: "Feb", sales: 52000, commissions: 5200 },
    { month: "Mar", sales: 48000, commissions: 4800 },
    { month: "Apr", sales: 61000, commissions: 6100 },
    { month: "May", sales: 58000, commissions: 5800 },
    { month: "Jun", sales: 67000, commissions: 6700 },
  ];

  const topPerformers = [
    { name: "John Smith", sales: 15200 },
    { name: "Sarah Johnson", sales: 12800 },
    { name: "Mike Davis", sales: 11500 },
    { name: "Emily Brown", sales: 10200 },
    { name: "David Wilson", sales: 9800 },
  ];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your MLM business performance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Sales"
          value={`$${stats?.totalSales.toLocaleString() || 0}`}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Total Commissions"
          value={`$${stats?.totalCommissions.toLocaleString() || 0}`}
          icon={TrendingUp}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Active Representatives"
          value={stats?.activeRepresentatives || 0}
          icon={Users}
          description="Across all levels"
        />
        <StatsCard
          title="Active Customers"
          value={stats?.activeCustomers || 0}
          icon={UserCircle}
          trend={{ value: 15.3, isPositive: true }}
        />
        <StatsCard
          title="Low Stock Items"
          value={stats?.lowStockProducts || 0}
          icon={AlertTriangle}
          description="Requires restocking"
        />
        <StatsCard
          title="Recent Sales"
          value={stats?.recentSales || 0}
          icon={Package}
          description="Last 30 days"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales & Commissions Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name="Sales ($)"
                />
                <Line
                  type="monotone"
                  dataKey="commissions"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Commissions ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPerformers} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="name" className="text-xs" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="sales" fill="hsl(var(--chart-1))" name="Sales ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {!aiLoading && aiRecommendations && aiRecommendations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">AI-Powered Insights</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {aiRecommendations.slice(0, 4).map((rec, idx) => (
              <AIInsightCard key={idx} recommendation={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
