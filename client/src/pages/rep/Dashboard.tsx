import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/StatsCard";
import { UserCircle, TrendingUp, DollarSign, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIInsightCard } from "@/components/AIInsightCard";
import type { DashboardStats, AIRecommendation } from "@shared/schema";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function RepDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/rep/stats"],
  });

  const { data: aiRecommendations, isLoading: aiLoading } = useQuery<AIRecommendation[]>({
    queryKey: ["/api/ai/recommendations/rep"],
  });

  const monthlyData = [
    { month: "Jan", sales: 12000, commissions: 1200 },
    { month: "Feb", sales: 15000, commissions: 1500 },
    { month: "Mar", sales: 13500, commissions: 1350 },
    { month: "Apr", sales: 18000, commissions: 1800 },
    { month: "May", sales: 16500, commissions: 1650 },
    { month: "Jun", sales: 20000, commissions: 2000 },
  ];

  const topCustomers = [
    { name: "Alice Johnson", sales: 4500 },
    { name: "Bob Smith", sales: 3800 },
    { name: "Carol Davis", sales: 3200 },
    { name: "David Lee", sales: 2900 },
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
        <h1 className="text-3xl font-bold tracking-tight">Representative Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track your performance and manage your customers
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="My Sales"
          value={`$${stats?.totalSales.toLocaleString() || 0}`}
          icon={TrendingUp}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="My Commissions"
          value={`$${stats?.totalCommissions.toLocaleString() || 0}`}
          icon={DollarSign}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="My Customers"
          value={stats?.activeCustomers || 0}
          icon={UserCircle}
          description="Active customers"
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
            <CardTitle>Sales & Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
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
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCustomers}>
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
          <h2 className="text-xl font-semibold mb-4">AI-Powered Insights for You</h2>
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
