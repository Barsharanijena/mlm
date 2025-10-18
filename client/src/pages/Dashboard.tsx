import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Award,
  Target,
  Activity,
  Star,
} from "lucide-react";
import type { User, Product, Customer, Sale } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAdmin,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: isAdmin ? ["/api/customers"] : ["/api/rep/customers"],
  });

  const { data: sales } = useQuery<Sale[]>({
    queryKey: isAdmin ? ["/api/sales"] : ["/api/rep/sales"],
  });

  // Calculate KPIs
  const totalRevenue = sales?.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0) || 0;
  const totalCommissions = sales?.reduce((sum, sale) => sum + parseFloat(sale.commissionAmount), 0) || 0;
  const averageOrderValue = sales && sales.length > 0 ? totalRevenue / sales.length : 0;
  const activeReps = users?.filter(u => u.role === "representative" && u.isActive).length || 0;
  const activeCustomers = customers?.filter(c => c.isActive).length || 0;
  const activeProducts = products?.filter(p => p.isActive).length || 0;

  // Top Products Analysis
  const productSales = sales?.reduce((acc, sale) => {
    const existing = acc.find(p => p.productId === sale.productId);
    if (existing) {
      existing.quantity += sale.quantity;
      existing.revenue += parseFloat(sale.totalAmount);
      existing.orders += 1;
    } else {
      acc.push({
        productId: sale.productId,
        quantity: sale.quantity,
        revenue: parseFloat(sale.totalAmount),
        orders: 1,
      });
    }
    return acc;
  }, [] as Array<{ productId: string; quantity: number; revenue: number; orders: number }>);

  const topProducts = productSales
    ?.sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(ps => {
      const product = products?.find(p => p.id === ps.productId);
      return {
        name: product?.name || "Unknown",
        revenue: ps.revenue,
        quantity: ps.quantity,
        orders: ps.orders,
      };
    }) || [];

  // Sales Trend Data (last 7 days)
  const salesTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const daySales = sales?.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate.toDateString() === date.toDateString();
    }) || [];

    return {
      date: dateStr,
      sales: daySales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0),
      orders: daySales.length,
      commissions: daySales.reduce((sum, sale) => sum + parseFloat(sale.commissionAmount), 0),
    };
  });

  // Top Representatives (Admin only)
  const repPerformance = isAdmin && users ? users
    .filter(u => u.role === "representative")
    .sort((a, b) => parseFloat(b.totalSales) - parseFloat(a.totalSales))
    .slice(0, 5)
    .map(rep => ({
      name: rep.fullName,
      sales: parseFloat(rep.totalSales),
      commissions: parseFloat(rep.totalCommissions),
      level: rep.performanceLevel,
    })) : [];

  // Category Distribution
  const categoryData = products?.reduce((acc, product) => {
    const existing = acc.find(c => c.category === product.category);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ category: product.category, count: 1 });
    }
    return acc;
  }, [] as Array<{ category: string; count: number }>) || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const KPICard = ({ title, value, icon: Icon, trend, trendValue, description }: any) => (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center gap-1 text-xs mt-1">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={trend === "up" ? "text-green-600" : "text-red-600"}>
              {trendValue}
            </span>
            <span className="text-muted-foreground">{description}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isAdmin ? "Admin Dashboard" : "Representative Dashboard"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.fullName}! Here's your performance overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend="up"
          trendValue="+12.5%"
          description="vs last month"
        />
        <KPICard
          title="Total Sales"
          value={sales?.length || 0}
          icon={ShoppingCart}
          trend="up"
          trendValue="+8.2%"
          description="vs last month"
        />
        {isAdmin ? (
          <KPICard
            title="Active Representatives"
            value={activeReps}
            icon={Users}
            trend="up"
            trendValue="+3"
            description="new this month"
          />
        ) : (
          <KPICard
            title="My Customers"
            value={activeCustomers}
            icon={Users}
            trend="up"
            trendValue="+5"
            description="new this month"
          />
        )}
        <KPICard
          title="Avg Order Value"
          value={`$${averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Target}
          trend="up"
          trendValue="+5.1%"
          description="vs last month"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Sales Trend */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Revenue and orders over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Revenue ($)"
                  dot={{ fill: '#3b82f6' }}
                />
                <Line
                  type="monotone"
                  dataKey="commissions"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Commissions ($)"
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Category Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
            <CardDescription>Distribution of products by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Performing Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top Performing Products
            </CardTitle>
            <CardDescription>Best sellers by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                  data-testid={`top-product-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.quantity} units · {product.orders} orders
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ${product.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Representatives or Recent Activity */}
        {isAdmin ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top Representatives
              </CardTitle>
              <CardDescription>Best performers by sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repPerformance.map((rep, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                    data-testid={`top-rep-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{rep.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {rep.level}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ${rep.sales.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${rep.commissions.toLocaleString('en-US', { minimumFractionDigits: 2 })} commission
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Your current standing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Sales</span>
                    <span className="font-bold">${user?.totalSales || "0.00"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Commissions</span>
                    <span className="font-bold text-green-600">${user?.totalCommissions || "0.00"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Performance Level</span>
                    <Badge>{user?.performanceLevel || "Bronze"}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Team Size</span>
                    <span className="font-bold">{user?.teamSize || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Commission Rate</span>
                    <span className="font-bold">{user?.commissionRate || "10.00"}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalCommissions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Earned from all sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Available in catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isAdmin ? "Total in system" : "Your customer base"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
