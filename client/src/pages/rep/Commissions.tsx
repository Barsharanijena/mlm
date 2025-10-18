import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock } from "lucide-react";
import type { Commission } from "@shared/schema";
import { format } from "date-fns";

interface CommissionWithDetails extends Commission {
  sale?: any;
}

export default function RepCommissions() {
  const { data: commissions, isLoading } = useQuery<CommissionWithDetails[]>({
    queryKey: ["/api/rep/commissions"],
  });

  const totalEarned = commissions
    ?.filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + parseFloat(c.amount), 0) || 0;

  const totalPending = commissions
    ?.filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + parseFloat(c.amount), 0) || 0;

  const columns = [
    {
      key: "createdAt",
      label: "Date",
      render: (commission: CommissionWithDetails) =>
        format(new Date(commission.createdAt), "MMM dd, yyyy"),
      sortable: true,
    },
    {
      key: "amount",
      label: "Amount",
      render: (commission: CommissionWithDetails) => (
        <span className="font-mono text-chart-2">
          ${parseFloat(commission.amount).toFixed(2)}
        </span>
      ),
      sortable: true,
    },
    {
      key: "level",
      label: "Level",
      render: (commission: CommissionWithDetails) => (
        <Badge variant="outline">Level {commission.level}</Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (commission: CommissionWithDetails) => (
        <Badge
          variant={commission.status === "paid" ? "default" : "secondary"}
        >
          {commission.status}
        </Badge>
      ),
    },
    {
      key: "paidAt",
      label: "Paid Date",
      render: (commission: CommissionWithDetails) =>
        commission.paidAt
          ? format(new Date(commission.paidAt), "MMM dd, yyyy")
          : "-",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Commissions</h1>
        <p className="text-muted-foreground mt-1">
          Track your commission earnings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-chart-2">
              ${totalEarned.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All paid commissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              ${totalPending.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Count</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {commissions?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All time commissions
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <DataTable
          data={commissions || []}
          columns={columns}
          searchPlaceholder="Search commissions..."
          emptyMessage="No commissions found"
        />
      )}
    </div>
  );
}
