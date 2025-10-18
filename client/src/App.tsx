import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";

import AdminDashboard from "@/pages/admin/Dashboard";
import Representatives from "@/pages/admin/Representatives";
import AdminCustomers from "@/pages/admin/Customers";
import Products from "@/pages/admin/Products";
import InventoryPage from "@/pages/admin/Inventory";
import SalesChain from "@/pages/admin/SalesChain";

import RepDashboard from "@/pages/rep/Dashboard";
import RepCustomers from "@/pages/rep/Customers";
import RepSales from "@/pages/rep/Sales";
import RepCommissions from "@/pages/rep/Commissions";

function ProtectedRoute({ component: Component, allowedRoles }: { component: any; allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login} />

      <Route path="/">
        {() => {
          if (!user) return <Redirect to="/login" />;
          return <Redirect to={user.role === "admin" ? "/admin" : "/rep"} />;
        }}
      </Route>

      <Route path="/admin">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          )} allowedRoles={["admin"]} />
        )}
      </Route>

      <Route path="/admin/representatives">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <Representatives />
            </DashboardLayout>
          )} allowedRoles={["admin"]} />
        )}
      </Route>

      <Route path="/admin/customers">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <AdminCustomers />
            </DashboardLayout>
          )} allowedRoles={["admin"]} />
        )}
      </Route>

      <Route path="/admin/products">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <Products />
            </DashboardLayout>
          )} allowedRoles={["admin"]} />
        )}
      </Route>

      <Route path="/admin/inventory">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <InventoryPage />
            </DashboardLayout>
          )} allowedRoles={["admin"]} />
        )}
      </Route>

      <Route path="/admin/chain">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <SalesChain />
            </DashboardLayout>
          )} allowedRoles={["admin"]} />
        )}
      </Route>

      <Route path="/rep">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <RepDashboard />
            </DashboardLayout>
          )} allowedRoles={["representative"]} />
        )}
      </Route>

      <Route path="/rep/customers">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <RepCustomers />
            </DashboardLayout>
          )} allowedRoles={["representative"]} />
        )}
      </Route>

      <Route path="/rep/sales">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <RepSales />
            </DashboardLayout>
          )} allowedRoles={["representative"]} />
        )}
      </Route>

      <Route path="/rep/commissions">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <RepCommissions />
            </DashboardLayout>
          )} allowedRoles={["representative"]} />
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
