import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, AlertTriangle } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Inventory, Product } from "@shared/schema";

interface InventoryWithProduct extends Inventory {
  product?: Product;
}

export default function InventoryPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryWithProduct | null>(null);
  const [formData, setFormData] = useState({
    quantity: 0,
    reorderLevel: 10,
  });

  const { data: inventory, isLoading } = useQuery<InventoryWithProduct[]>({
    queryKey: ["/api/inventory"],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ quantity: number; reorderLevel: number }> }) =>
      apiRequest("PATCH", `/api/inventory/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({ title: "Inventory updated successfully" });
      setIsDialogOpen(false);
    },
  });

  const handleEdit = (item: InventoryWithProduct) => {
    setEditingItem(item);
    setFormData({
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    }
  };

  const columns = [
    {
      key: "product",
      label: "Product",
      render: (item: InventoryWithProduct) => item.product?.name || "Unknown",
      sortable: true,
    },
    {
      key: "sku",
      label: "SKU",
      render: (item: InventoryWithProduct) => item.product?.sku || "-",
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (item: InventoryWithProduct) => (
        <span className="font-mono">{item.quantity}</span>
      ),
      sortable: true,
    },
    {
      key: "reorderLevel",
      label: "Reorder Level",
      render: (item: InventoryWithProduct) => (
        <span className="font-mono">{item.reorderLevel}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item: InventoryWithProduct) => {
        const isLow = item.quantity <= item.reorderLevel;
        return (
          <Badge variant={isLow ? "destructive" : "default"}>
            {isLow ? (
              <>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Low Stock
              </>
            ) : (
              "In Stock"
            )}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: InventoryWithProduct) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(item)}
          data-testid={`button-edit-${item.id}`}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground mt-1">
          Track stock levels and manage inventory
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <DataTable
          data={inventory || []}
          columns={columns}
          searchPlaceholder="Search inventory..."
          emptyMessage="No inventory items found"
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Inventory</DialogTitle>
            <DialogDescription>
              Adjust stock levels for {editingItem?.product?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Current Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseInt(e.target.value) })
                  }
                  required
                  data-testid="input-quantity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })
                  }
                  required
                  data-testid="input-reorder"
                />
                <p className="text-xs text-muted-foreground">
                  Alert when stock falls below this level
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                data-testid="button-submit"
              >
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
