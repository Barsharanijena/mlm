import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import type { Customer, User } from "@shared/schema";

interface CustomerWithRep extends Customer {
  representative?: User;
}

export default function Customers() {
  const { data: customers, isLoading } = useQuery<CustomerWithRep[]>({
    queryKey: ["/api/customers"],
  });

  const columns = [
    { key: "name", label: "Customer Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone" },
    {
      key: "representative",
      label: "Representative",
      render: (customer: CustomerWithRep) =>
        customer.representative?.fullName || "Unknown",
    },
    {
      key: "isActive",
      label: "Status",
      render: (customer: CustomerWithRep) => (
        <Badge variant={customer.isActive ? "default" : "secondary"}>
          {customer.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground mt-1">
          View all customers across your network
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <DataTable
          data={customers || []}
          columns={columns}
          searchPlaceholder="Search customers..."
          emptyMessage="No customers found"
        />
      )}
    </div>
  );
}
