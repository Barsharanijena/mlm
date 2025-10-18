import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Sale, Customer, Product, InsertSale } from "@shared/schema";
import { format } from "date-fns";

interface SaleWithDetails extends Sale {
  customer?: Customer;
  product?: Product;
}

export default function RepSales() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    productId: "",
    quantity: 1,
    unitPrice: "0",
  });

  const { data: sales, isLoading } = useQuery<SaleWithDetails[]>({
    queryKey: ["/api/rep/sales"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/rep/customers"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<InsertSale>) => apiRequest("POST", "/api/sales", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rep/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rep/stats"] });
      toast({ title: "Sale recorded successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to record sale",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      customerId: "",
      productId: "",
      quantity: 1,
      unitPrice: "0",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProduct = products?.find((p) => p.id === formData.productId);
    const totalAmount = (
      parseFloat(formData.unitPrice) * formData.quantity
    ).toFixed(2);
    const commissionRate = parseFloat(user?.commissionRate || "10") / 100;
    const commissionAmount = (parseFloat(totalAmount) * commissionRate).toFixed(2);

    createMutation.mutate({
      ...formData,
      representativeId: user?.id || "",
      totalAmount,
      commissionAmount,
      status: "completed",
    });
  };

  const handleProductChange = (productId: string) => {
    const product = products?.find((p) => p.id === productId);
    setFormData({
      ...formData,
      productId,
      unitPrice: product?.basePrice || "0",
    });
  };

  const columns = [
    {
      key: "createdAt",
      label: "Date",
      render: (sale: SaleWithDetails) =>
        format(new Date(sale.createdAt), "MMM dd, yyyy"),
      sortable: true,
    },
    {
      key: "customer",
      label: "Customer",
      render: (sale: SaleWithDetails) => sale.customer?.name || "Unknown",
    },
    {
      key: "product",
      label: "Product",
      render: (sale: SaleWithDetails) => sale.product?.name || "Unknown",
    },
    {
      key: "quantity",
      label: "Qty",
      render: (sale: SaleWithDetails) => (
        <span className="font-mono">{sale.quantity}</span>
      ),
    },
    {
      key: "totalAmount",
      label: "Total",
      render: (sale: SaleWithDetails) => (
        <span className="font-mono">${parseFloat(sale.totalAmount).toFixed(2)}</span>
      ),
      sortable: true,
    },
    {
      key: "commissionAmount",
      label: "Commission",
      render: (sale: SaleWithDetails) => (
        <span className="font-mono text-chart-2">
          ${parseFloat(sale.commissionAmount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (sale: SaleWithDetails) => (
        <Badge variant="default">{sale.status}</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground mt-1">
            Record and track your sales transactions
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-sale">
          <Plus className="h-4 w-4 mr-2" />
          Record Sale
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <DataTable
          data={sales || []}
          columns={columns}
          searchPlaceholder="Search sales..."
          emptyMessage="No sales found"
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record New Sale</DialogTitle>
            <DialogDescription>
              Create a new sales transaction
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, customerId: value })
                  }
                >
                  <SelectTrigger data-testid="select-customer">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={formData.productId}
                  onValueChange={handleProductChange}
                >
                  <SelectTrigger data-testid="select-product">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.filter((p) => p.isActive).map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - ${parseFloat(product.basePrice).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value),
                      })
                    }
                    required
                    data-testid="input-quantity"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price ($)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, unitPrice: e.target.value })
                    }
                    required
                    data-testid="input-price"
                  />
                </div>
              </div>

              <div className="rounded-md bg-muted p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-mono font-semibold">
                    ${(parseFloat(formData.unitPrice) * formData.quantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Your Commission ({user?.commissionRate}%):
                  </span>
                  <span className="font-mono font-semibold text-chart-2">
                    $
                    {(
                      parseFloat(formData.unitPrice) *
                      formData.quantity *
                      (parseFloat(user?.commissionRate || "10") / 100)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-submit"
              >
                Record Sale
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
