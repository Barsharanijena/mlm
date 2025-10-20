import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
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
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  ShoppingBag,
  CreditCard,
  Percent,
  Eye,
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

  // Advanced KPI Calculations
  const totalRevenue = sales?.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0) || 0;
  const totalCommissions = sales?.reduce((sum, sale) => sum + parseFloat(sale.commissionAmount), 0) || 0;
  const averageOrderValue = sales && sales.length > 0 ? totalRevenue / sales.length : 0;
  const activeReps = users?.filter(u => u.role === "representative" && u.isActive).length || 0;
  const activeCustomers = customers?.filter(c => c.isActive).length || 0;
  const totalCustomers = customers?.length || 0;
  const activeProducts = products?.filter(p => p.isActive).length || 0;
  const totalProducts = products?.length || 0;
  
  // Calculate conversion and growth metrics
  const conversionRate = totalCustomers > 0 ? ((sales?.length || 0) / totalCustomers * 100) : 0;
  const profitMargin = totalRevenue > 0 ? (totalCommissions / totalRevenue * 100) : 0;
  
  // Last 30 days sales for trend calculation
  const last30Days = sales?.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return saleDate >= thirtyDaysAgo;
  }) || [];
  
  const last30DaysRevenue = last30Days.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
  const previous30DaysRevenue = totalRevenue - last30DaysRevenue;
  const revenueGrowth = previous30DaysRevenue > 0 
    ? ((last30DaysRevenue - previous30DaysRevenue) / previous30DaysRevenue * 100) 
    : 0;

  // Sales Trend Data (last 14 days with more detail)
  const salesTrend = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const daySales = sales?.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate.toDateString() === date.toDateString();
    }) || [];

    return {
      date: dateStr,
      revenue: daySales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0),
      orders: daySales.length,
      commissions: daySales.reduce((sum, sale) => sum + parseFloat(sale.commissionAmount), 0),
      customers: new Set(daySales.map(s => s.customerId)).size,
    };
  });

  // Hourly distribution for today
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const todaySales = sales?.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      const today = new Date();
      return saleDate.toDateString() === today.toDateString() && saleDate.getHours() === hour;
    }) || [];

    return {
      hour: `${hour}:00`,
      sales: todaySales.length,
      revenue: todaySales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0),
    };
  });

  // Top Products Analysis with more metrics
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
    .slice(0, 8)
    .map(ps => {
      const product = products?.find(p => p.id === ps.productId);
      return {
        name: product?.name || "Unknown",
        category: product?.category || "Other",
        revenue: ps.revenue,
        quantity: ps.quantity,
        orders: ps.orders,
        avgPrice: ps.revenue / ps.quantity,
      };
    }) || [];

  // Top Representatives with detailed metrics
  const repPerformance = isAdmin && users ? users
    .filter(u => u.role === "representative")
    .map(rep => {
      const repSales = sales?.filter(s => s.userId === rep.id) || [];
      const repRevenue = repSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
      const repCommissions = repSales.reduce((sum, sale) => sum + parseFloat(sale.commissionAmount), 0);
      return {
        id: rep.id,
        name: rep.fullName,
        email: rep.email,
        sales: repRevenue,
        commissions: repCommissions,
        orders: repSales.length,
        level: rep.performanceLevel,
        teamSize: rep.teamSize,
      };
    })
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 6) : [];

  // Category Performance
  const categoryPerformance = products?.reduce((acc, product) => {
    const productRevenue = sales
      ?.filter(s => s.productId === product.id)
      .reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0) || 0;
    
    const existing = acc.find(c => c.category === product.category);
    if (existing) {
      existing.revenue += productRevenue;
      existing.products += 1;
    } else {
      acc.push({
        category: product.category,
        revenue: productRevenue,
        products: 1,
      });
    }
    return acc;
  }, [] as Array<{ category: string; revenue: number; products: number }>)
    .sort((a, b) => b.revenue - a.revenue) || [];

  // Recent Activity
  const recentActivity = sales
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map(sale => {
      const customer = customers?.find(c => c.id === sale.customerId);
      const product = products?.find(p => p.id === sale.productId);
      return {
        id: sale.id,
        customer: customer?.name || "Unknown",
        product: product?.name || "Unknown",
        amount: parseFloat(sale.totalAmount),
        quantity: sale.quantity,
        time: new Date(sale.createdAt),
        status: sale.paymentStatus,
      };
    }) || [];

  // Customer Tiers Distribution
  const tierDistribution = customers?.reduce((acc, customer) => {
    const existing = acc.find(t => t.tier === customer.customerTier);
    if (existing) {
      existing.count += 1;
      existing.revenue += parseFloat(customer.totalPurchases);
    } else {
      acc.push({
        tier: customer.customerTier,
        count: 1,
        revenue: parseFloat(customer.totalPurchases),
      });
    }
    return acc;
  }, [] as Array<{ tier: string; count: number; revenue: number }>) || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  const GRADIENT_COLORS = ['#60a5fa', '#3b82f6'];

  const DetailedKPICard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue, 
    subtitle,
    progress,
    sparklineData,
    badge,
  }: any) => (
    <Card className="hover-elevate overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {badge && <Badge variant="outline" className="text-xs">{badge}</Badge>}
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend && (
          <div className="flex items-center gap-1 text-xs mt-2">
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3 text-green-600" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-600" />
            )}
            <span className={trend === "up" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {trendValue}
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        )}
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-2 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} fill="url(#sparkGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Prepare sparkline data for KPIs
  const revenueSparkline = salesTrend.slice(-7).map(d => ({ value: d.revenue }));
  const ordersSparkline = salesTrend.slice(-7).map(d => ({ value: d.orders }));

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {isAdmin ? "Analytics Dashboard" : "Performance Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Welcome back, {user?.fullName}! Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1.5">
            <Activity className="h-3 w-3 mr-1.5" />
            Live Data
          </Badge>
          <Button variant="outline" size="sm" data-testid="button-export">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Enhanced KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DetailedKPICard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          trend={revenueGrowth >= 0 ? "up" : "down"}
          trendValue={`${Math.abs(revenueGrowth).toFixed(1)}%`}
          subtitle="Last 30 days performance"
          sparklineData={revenueSparkline}
          badge="Primary"
        />
        <DetailedKPICard
          title="Total Orders"
          value={sales?.length || 0}
          icon={ShoppingCart}
          trend="up"
          trendValue="+8.2%"
          subtitle={`${last30Days.length} orders this month`}
          sparklineData={ordersSparkline}
        />
        {isAdmin ? (
          <DetailedKPICard
            title="Active Network"
            value={activeReps}
            icon={Users}
            trend="up"
            trendValue="+3"
            subtitle={`${totalCustomers} total customers`}
            progress={(activeReps / (users?.length || 1)) * 100}
          />
        ) : (
          <DetailedKPICard
            title="My Customers"
            value={activeCustomers}
            icon={Users}
            trend="up"
            trendValue="+5"
            subtitle={`${totalCustomers} total assigned`}
            progress={(activeCustomers / totalCustomers) * 100}
          />
        )}
        <DetailedKPICard
          title="Avg Order Value"
          value={`$${averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={Target}
          trend="up"
          trendValue="+5.1%"
          subtitle="Per transaction metric"
        />
      </div>

      {/* Secondary KPI Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <Progress value={conversionRate} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalCommissions.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{profitMargin.toFixed(1)}% profit margin</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Active Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">of {totalProducts} total</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Items Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sales?.reduce((sum, s) => sum + s.quantity, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total units moved</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue & Orders Trend - Area Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Revenue & Order Trends
                </CardTitle>
                <CardDescription>14-day performance overview</CardDescription>
              </div>
              <Badge variant="outline">Last 2 weeks</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={salesTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: any) => `$${parseFloat(value).toFixed(2)}`}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="commissions"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCommission)"
                  name="Commissions"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 3 }}
                  name="Orders"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution - Enhanced Pie */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-purple-500" />
                  Revenue by Category
                </CardTitle>
                <CardDescription>Performance breakdown</CardDescription>
              </div>
              <Badge variant="outline">{categoryPerformance.length} categories</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, revenue }) => 
                    `${category}: $${(revenue/1000).toFixed(1)}k`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {categoryPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Activity & Top Products */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hourly Activity Pattern */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Today's Activity Pattern
                </CardTitle>
                <CardDescription>Sales distribution by hour</CardDescription>
              </div>
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date().toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 11 }}
                  interval={2}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Tiers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Customer Tiers
            </CardTitle>
            <CardDescription>Distribution by tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tierDistribution.map((tier, index) => (
                <div key={tier.tier} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{tier.tier}</span>
                    </div>
                    <span className="text-sm font-bold">{tier.count}</span>
                  </div>
                  <Progress
                    value={(tier.count / totalCustomers) * 100}
                    className="h-2"
                    style={{
                      ['--progress-background' as any]: COLORS[index % COLORS.length],
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    ${tier.revenue.toLocaleString('en-US', { minimumFractionDigits: 0 })} revenue
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Representatives/Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performing Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Top Products
                </CardTitle>
                <CardDescription>Best performers by revenue</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.slice(0, 6).map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                  data-testid={`top-product-${index}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 text-white font-bold text-sm shrink-0">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Badge variant="outline" className="text-xs px-1.5 py-0">{product.category}</Badge>
                        <span>{product.quantity} units</span>
                        <span>•</span>
                        <span>{product.orders} orders</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-bold text-green-600">
                      ${product.revenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${product.avgPrice.toFixed(2)} avg
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Top Representatives
                  </CardTitle>
                  <CardDescription>Leading performers this period</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {repPerformance.map((rep, index) => (
                  <div
                    key={rep.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                    data-testid={`top-rep-${index}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 text-white font-bold text-sm shrink-0">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{rep.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            {rep.level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{rep.orders} orders</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="font-bold">
                        ${rep.sales.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-green-600">
                        ${rep.commissions.toLocaleString('en-US', { minimumFractionDigits: 2 })} earned
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest transactions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover-elevate"
                    data-testid={`activity-${activity.id}`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.customer}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.product}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time.toLocaleTimeString()} • {activity.quantity} units
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-green-600">
                        ${activity.amount.toFixed(2)}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
