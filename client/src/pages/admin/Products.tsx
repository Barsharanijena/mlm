import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, InsertProduct } from "@shared/schema";

export default function Products() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<InsertProduct>>({
    name: "",
    description: "",
    category: "",
    basePrice: "0",
    sku: "",
    isActive: true,
    weightUnit: "kg",
    dimensionUnit: "cm",
    shippingClass: "Standard",
  });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertProduct) => apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({ title: "Product created successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertProduct> }) =>
      apiRequest("PATCH", `/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product updated successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/products/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({ title: "Product deleted successfully" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      basePrice: "0",
      sku: "",
      isActive: true,
      weightUnit: "kg",
      dimensionUnit: "cm",
      shippingClass: "Standard",
    });
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData as InsertProduct);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand || "",
      description: product.description || "",
      category: product.category,
      subCategory: product.subCategory || "",
      manufacturer: product.manufacturer || "",
      model: product.model || "",
      sku: product.sku,
      barcode: product.barcode || "",
      upc: product.upc || "",
      costPrice: product.costPrice || "0",
      basePrice: product.basePrice,
      retailPrice: product.retailPrice || "",
      wholesalePrice: product.wholesalePrice || "",
      taxRate: product.taxRate || "0",
      weight: product.weight || "",
      weightUnit: product.weightUnit || "kg",
      length: product.length || "",
      width: product.width || "",
      height: product.height || "",
      dimensionUnit: product.dimensionUnit || "cm",
      color: product.color || "",
      size: product.size || "",
      material: product.material || "",
      imageUrl: product.imageUrl || "",
      imageUrl2: product.imageUrl2 || "",
      imageUrl3: product.imageUrl3 || "",
      videoUrl: product.videoUrl || "",
      warrantyPeriod: product.warrantyPeriod || "",
      warrantyDetails: product.warrantyDetails || "",
      returnPolicy: product.returnPolicy || "",
      shippingClass: product.shippingClass || "Standard",
      fragile: product.fragile ?? false,
      perishable: product.perishable ?? false,
      hazardous: product.hazardous ?? false,
      supplierName: product.supplierName || "",
      supplierContact: product.supplierContact || "",
      supplierEmail: product.supplierEmail || "",
      leadTime: product.leadTime || "",
      minimumOrderQuantity: product.minimumOrderQuantity || 1,
      tags: product.tags || "",
      metaKeywords: product.metaKeywords || "",
      metaDescription: product.metaDescription || "",
      seoUrl: product.seoUrl || "",
      notes: product.notes || "",
      isActive: product.isActive,
    });
    setIsDialogOpen(true);
  };

  const categories = [
    "Electronics", "Clothing", "Food & Beverage", "Health & Wellness", 
    "Home & Garden", "Beauty & Personal Care", "Sports & Fitness", 
    "Books & Media", "Toys & Games", "Automotive", "Office Supplies", "Other"
  ];

  const columns = [
    { key: "name", label: "Product Name", sortable: true },
    { key: "brand", label: "Brand", sortable: true },
    { key: "sku", label: "SKU", sortable: true },
    { key: "category", label: "Category", sortable: true },
    {
      key: "basePrice",
      label: "Base Price",
      render: (product: Product) => (
        <span className="font-mono">${parseFloat(product.basePrice).toFixed(2)}</span>
      ),
      sortable: true,
    },
    {
      key: "isActive",
      label: "Status",
      render: (product: Product) => (
        <Badge variant={product.isActive ? "default" : "secondary"}>
          {product.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (product: Product) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(product)}
            data-testid={`button-edit-${product.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteMutation.mutate(product.id)}
            data-testid={`button-delete-${product.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your comprehensive product catalog
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <DataTable
          data={products || []}
          columns={columns}
          searchPlaceholder="Search products..."
          emptyMessage="No products found"
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update product information with comprehensive details"
                : "Create a new product with detailed specifications"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="specs">Specs</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="supplier">Supplier</TabsTrigger>
                <TabsTrigger value="additional">Additional</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand || ""}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      data-testid="input-brand"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    data-testid="input-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subCategory">Sub Category</Label>
                    <Input
                      id="subCategory"
                      value={formData.subCategory || ""}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      data-testid="input-subcategory"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      required
                      data-testid="input-sku"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode || ""}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      data-testid="input-barcode"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upc">UPC</Label>
                    <Input
                      id="upc"
                      value={formData.upc || ""}
                      onChange={(e) => setFormData({ ...formData, upc: e.target.value })}
                      data-testid="input-upc"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer || ""}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      data-testid="input-manufacturer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model Number</Label>
                    <Input
                      id="model"
                      value={formData.model || ""}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      data-testid="input-model"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Cost Price ($)</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      value={formData.costPrice || "0"}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      data-testid="input-cost-price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Base Price ($) *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      required
                      data-testid="input-base-price"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="retailPrice">Retail Price ($)</Label>
                    <Input
                      id="retailPrice"
                      type="number"
                      step="0.01"
                      value={formData.retailPrice || ""}
                      onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                      data-testid="input-retail-price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wholesalePrice">Wholesale Price ($)</Label>
                    <Input
                      id="wholesalePrice"
                      type="number"
                      step="0.01"
                      value={formData.wholesalePrice || ""}
                      onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                      data-testid="input-wholesale-price"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={formData.taxRate || "0"}
                    onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                    data-testid="input-tax-rate"
                  />
                </div>
              </TabsContent>

              {/* Specifications Tab */}
              <TabsContent value="specs" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight || ""}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      data-testid="input-weight"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weightUnit">Weight Unit</Label>
                    <Select value={formData.weightUnit || "kg"} onValueChange={(value) => setFormData({ ...formData, weightUnit: value })}>
                      <SelectTrigger data-testid="select-weight-unit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="lb">Pounds (lb)</SelectItem>
                        <SelectItem value="g">Grams (g)</SelectItem>
                        <SelectItem value="oz">Ounces (oz)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-3 grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="length">Length</Label>
                      <Input
                        id="length"
                        type="number"
                        step="0.01"
                        value={formData.length || ""}
                        onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                        data-testid="input-length"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="width">Width</Label>
                      <Input
                        id="width"
                        type="number"
                        step="0.01"
                        value={formData.width || ""}
                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                        data-testid="input-width"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height</Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.01"
                        value={formData.height || ""}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        data-testid="input-height"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimensionUnit">Unit</Label>
                    <Select value={formData.dimensionUnit || "cm"} onValueChange={(value) => setFormData({ ...formData, dimensionUnit: value })}>
                      <SelectTrigger data-testid="select-dimension-unit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">Centimeters (cm)</SelectItem>
                        <SelectItem value="in">Inches (in)</SelectItem>
                        <SelectItem value="m">Meters (m)</SelectItem>
                        <SelectItem value="ft">Feet (ft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color || ""}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      data-testid="input-color"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Input
                      id="size"
                      value={formData.size || ""}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      data-testid="input-size"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      value={formData.material || ""}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      data-testid="input-material"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Primary Image URL</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://..."
                    value={formData.imageUrl || ""}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    data-testid="input-image-url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl2">Image URL 2</Label>
                  <Input
                    id="imageUrl2"
                    placeholder="https://..."
                    value={formData.imageUrl2 || ""}
                    onChange={(e) => setFormData({ ...formData, imageUrl2: e.target.value })}
                    data-testid="input-image-url-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl3">Image URL 3</Label>
                  <Input
                    id="imageUrl3"
                    placeholder="https://..."
                    value={formData.imageUrl3 || ""}
                    onChange={(e) => setFormData({ ...formData, imageUrl3: e.target.value })}
                    data-testid="input-image-url-3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Product Video URL</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://youtube.com/..."
                    value={formData.videoUrl || ""}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    data-testid="input-video-url"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold">Warranty & Return Policy</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warrantyPeriod">Warranty Period</Label>
                      <Input
                        id="warrantyPeriod"
                        placeholder="e.g., 1 year, 90 days"
                        value={formData.warrantyPeriod || ""}
                        onChange={(e) => setFormData({ ...formData, warrantyPeriod: e.target.value })}
                        data-testid="input-warranty-period"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warrantyDetails">Warranty Details</Label>
                    <Textarea
                      id="warrantyDetails"
                      value={formData.warrantyDetails || ""}
                      onChange={(e) => setFormData({ ...formData, warrantyDetails: e.target.value })}
                      rows={2}
                      data-testid="input-warranty-details"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="returnPolicy">Return Policy</Label>
                    <Textarea
                      id="returnPolicy"
                      value={formData.returnPolicy || ""}
                      onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
                      rows={2}
                      data-testid="input-return-policy"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Supplier & Shipping Tab */}
              <TabsContent value="supplier" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplierName">Supplier Name</Label>
                    <Input
                      id="supplierName"
                      value={formData.supplierName || ""}
                      onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                      data-testid="input-supplier-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplierContact">Supplier Contact</Label>
                    <Input
                      id="supplierContact"
                      value={formData.supplierContact || ""}
                      onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
                      data-testid="input-supplier-contact"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplierEmail">Supplier Email</Label>
                  <Input
                    id="supplierEmail"
                    type="email"
                    value={formData.supplierEmail || ""}
                    onChange={(e) => setFormData({ ...formData, supplierEmail: e.target.value })}
                    data-testid="input-supplier-email"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leadTime">Lead Time (days)</Label>
                    <Input
                      id="leadTime"
                      value={formData.leadTime || ""}
                      onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                      data-testid="input-lead-time"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumOrderQuantity">Minimum Order Qty</Label>
                    <Input
                      id="minimumOrderQuantity"
                      type="number"
                      value={formData.minimumOrderQuantity || 1}
                      onChange={(e) => setFormData({ ...formData, minimumOrderQuantity: parseInt(e.target.value) || 1 })}
                      data-testid="input-moq"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold">Shipping Information</h4>
                  <div className="space-y-2">
                    <Label htmlFor="shippingClass">Shipping Class</Label>
                    <Select value={formData.shippingClass || "Standard"} onValueChange={(value) => setFormData({ ...formData, shippingClass: value })}>
                      <SelectTrigger data-testid="select-shipping-class">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Express">Express</SelectItem>
                        <SelectItem value="Overnight">Overnight</SelectItem>
                        <SelectItem value="Freight">Freight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="fragile"
                        checked={formData.fragile ?? false}
                        onChange={(e) => setFormData({ ...formData, fragile: e.target.checked })}
                        className="rounded border-gray-300"
                        data-testid="checkbox-fragile"
                      />
                      <Label htmlFor="fragile" className="cursor-pointer">Fragile</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="perishable"
                        checked={formData.perishable ?? false}
                        onChange={(e) => setFormData({ ...formData, perishable: e.target.checked })}
                        className="rounded border-gray-300"
                        data-testid="checkbox-perishable"
                      />
                      <Label htmlFor="perishable" className="cursor-pointer">Perishable</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hazardous"
                        checked={formData.hazardous ?? false}
                        onChange={(e) => setFormData({ ...formData, hazardous: e.target.checked })}
                        className="rounded border-gray-300"
                        data-testid="checkbox-hazardous"
                      />
                      <Label htmlFor="hazardous" className="cursor-pointer">Hazardous</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Additional/SEO Tab */}
              <TabsContent value="additional" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="premium, bestseller, new"
                    value={formData.tags || ""}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    data-testid="input-tags"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Meta Keywords (SEO)</Label>
                  <Input
                    id="metaKeywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={formData.metaKeywords || ""}
                    onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                    data-testid="input-meta-keywords"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="Brief description for search engines"
                    value={formData.metaDescription || ""}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    rows={2}
                    data-testid="input-meta-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoUrl">SEO-Friendly URL Slug</Label>
                  <Input
                    id="seoUrl"
                    placeholder="product-name-slug"
                    value={formData.seoUrl || ""}
                    onChange={(e) => setFormData({ ...formData, seoUrl: e.target.value })}
                    data-testid="input-seo-url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Internal Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Notes for internal use only"
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    data-testid="input-notes"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                    data-testid="checkbox-active"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">Product Active</Label>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
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
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit"
              >
                {editingProduct ? "Update Product" : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
