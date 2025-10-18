import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Customer, User as Representative, Sale } from "@shared/schema";
import avatar1 from "@assets/stock_images/professional_busines_8764c34f.jpg";
import avatar2 from "@assets/stock_images/professional_busines_fe209bba.jpg";
import avatar3 from "@assets/stock_images/professional_busines_9c335cb5.jpg";

const avatars = [avatar1, avatar2, avatar3];

export default function AdminCustomers() {
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: representatives, isLoading: repsLoading } = useQuery<Representative[]>({
    queryKey: ["/api/representatives"],
  });

  const { data: allSales, isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const getRepresentative = (repId: string) => {
    return representatives?.find(r => r.id === repId);
  };

  const getCustomerSales = (customerId: string) => {
    return allSales?.filter(s => s.customerId === customerId) || [];
  };

  const getAvatarForCustomer = (customerId: string) => {
    const hash = customerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatars[hash % avatars.length];
  };

  const columns = [
    {
      key: "avatar",
      label: "",
      render: (customer: Customer) => (
        <Avatar className="h-10 w-10">
          <AvatarImage src={getAvatarForCustomer(customer.id)} alt={customer.name} />
          <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
        </Avatar>
      ),
    },
    { key: "name", label: "Customer Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "company",
      label: "Company",
      render: (customer: Customer) => customer.company || "—",
    },
    {
      key: "representativeId",
      label: "Representative",
      render: (customer: Customer) => {
        const rep = getRepresentative(customer.representativeId);
        return rep ? (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{rep.fullName}</span>
          </div>
        ) : (
          "—"
        );
      },
    },
    {
      key: "customerTier",
      label: "Tier",
      render: (customer: Customer) => {
        const tierColors: Record<string, string> = {
          Platinum: "default",
          Gold: "default",
          Silver: "secondary",
          Standard: "outline",
        };
        return <Badge variant={tierColors[customer.customerTier] as any}>{customer.customerTier}</Badge>;
      },
    },
    {
      key: "totalPurchases",
      label: "Total Purchases",
      render: (customer: Customer) => (
        <span className="font-mono text-green-600">
          ${parseFloat(customer.totalPurchases).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
      sortable: true,
    },
    {
      key: "isActive",
      label: "Status",
      render: (customer: Customer) => (
        <Badge variant={customer.isActive ? "default" : "secondary"}>
          {customer.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (customer: Customer) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleView(customer)}
          data-testid={`button-view-${customer.id}`}
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Customers</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all customers across the organization
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading customers...</div>
        </div>
      ) : (
        <DataTable
          data={customers || []}
          columns={columns}
          searchPlaceholder="Search customers..."
          emptyMessage="No customers found"
        />
      )}

      {/* Customer Detail View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={viewingCustomer ? getAvatarForCustomer(viewingCustomer.id) : ""}
                  alt={viewingCustomer?.name}
                />
                <AvatarFallback>{viewingCustomer?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div>{viewingCustomer?.name}</div>
                <div className="text-sm text-muted-foreground font-normal">
                  {viewingCustomer?.email}
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              Comprehensive customer information and purchase history
            </DialogDescription>
          </DialogHeader>

          {viewingCustomer && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="representative">Representative</TabsTrigger>
                <TabsTrigger value="history">Purchase History</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Information Tab */}
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{viewingCustomer.email}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{viewingCustomer.phone || "—"}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-muted-foreground">Date of Birth:</span>
                        <span className="font-medium">{viewingCustomer.dateOfBirth || "—"}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-muted-foreground">Gender:</span>
                        <span className="font-medium">{viewingCustomer.gender || "—"}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-muted-foreground">Language:</span>
                        <span className="font-medium">{viewingCustomer.language}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-muted-foreground">Company:</span>
                        <span className="font-medium">{viewingCustomer.company || "—"}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-muted-foreground">Job Title:</span>
                        <span className="font-medium">{viewingCustomer.jobTitle || "—"}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-muted-foreground">Industry:</span>
                        <span className="font-medium">{viewingCustomer.industry || "—"}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-muted-foreground">Company Size:</span>
                        <span className="font-medium">{viewingCustomer.companySize || "—"}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-muted-foreground">Website:</span>
                        <span className="font-medium">{viewingCustomer.website || "—"}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Billing Address</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p>{viewingCustomer.billingStreet || "—"}</p>
                      <p>
                        {viewingCustomer.billingCity && `${viewingCustomer.billingCity}, `}
                        {viewingCustomer.billingState} {viewingCustomer.billingZipCode}
                      </p>
                      <p>{viewingCustomer.billingCountry}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p>{viewingCustomer.shippingStreet || "—"}</p>
                      <p>
                        {viewingCustomer.shippingCity && `${viewingCustomer.shippingCity}, `}
                        {viewingCustomer.shippingState} {viewingCustomer.shippingZipCode}
                      </p>
                      <p>{viewingCustomer.shippingCountry}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Financial & MLM Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Customer Tier</p>
                      <Badge className="mt-1">{viewingCustomer.customerTier}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Credit Limit</p>
                      <p className="font-bold mt-1">
                        ${parseFloat(viewingCustomer.creditLimit || "0").toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Terms</p>
                      <p className="font-medium mt-1">{viewingCustomer.paymentTerms}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Discount</p>
                      <p className="font-medium mt-1">
                        {parseFloat(viewingCustomer.discountPercentage).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Loyalty Points</p>
                      <p className="font-bold text-primary mt-1">{viewingCustomer.loyaltyPoints}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant={viewingCustomer.isActive ? "default" : "secondary"} className="mt-1">
                        {viewingCustomer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Representative Tab */}
              <TabsContent value="representative" className="space-y-4">
                {(() => {
                  const rep = getRepresentative(viewingCustomer.representativeId);
                  return rep ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={avatars[0]}
                              alt={rep.fullName}
                            />
                            <AvatarFallback>{rep.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-lg">{rep.fullName}</div>
                            <div className="text-sm text-muted-foreground font-normal">{rep.email}</div>
                          </div>
                        </CardTitle>
                        <CardDescription>Assigned Sales Representative</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{rep.phone || "—"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Performance Level</p>
                            <Badge className="mt-1">{rep.performanceLevel}</Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Sales</p>
                            <p className="font-bold text-green-600">
                              ${parseFloat(rep.totalSales).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Commission Rate</p>
                            <p className="font-medium">{parseFloat(rep.commissionRate).toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Team Size</p>
                            <p className="font-medium">{rep.teamSize} members</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant={rep.isActive ? "default" : "secondary"}>
                              {rep.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">No representative assigned</p>
                      </CardContent>
                    </Card>
                  );
                })()}
              </TabsContent>

              {/* Purchase History Tab */}
              <TabsContent value="history" className="space-y-4">
                {(() => {
                  const customerSales = getCustomerSales(viewingCustomer.id);
                  const totalSpent = customerSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
                  const avgOrderValue = customerSales.length > 0 ? totalSpent / customerSales.length : 0;

                  return (
                    <>
                      <div className="grid grid-cols-4 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">{customerSales.length}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-muted-foreground">Total Spent</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                              ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-muted-foreground">Avg Order Value</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">
                              ${avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-muted-foreground">First Purchase</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm font-medium">
                              {viewingCustomer.firstPurchaseDate
                                ? new Date(viewingCustomer.firstPurchaseDate).toLocaleDateString()
                                : "—"}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {customerSales.slice(0, 10).map((sale) => (
                              <div
                                key={sale.id}
                                className="flex justify-between items-center p-3 rounded-lg border"
                                data-testid={`sale-${sale.id}`}
                              >
                                <div>
                                  <p className="font-medium">Order #{sale.id.slice(0, 8)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(sale.createdAt).toLocaleDateString()} - Qty: {sale.quantity}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-green-600">
                                    ${parseFloat(sale.totalAmount).toFixed(2)}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {sale.paymentStatus}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            {customerSales.length === 0 && (
                              <p className="text-center text-muted-foreground py-8">
                                No purchase history available
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Customer Lifetime Value</CardTitle>
                      <CardDescription>Total value metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Purchases:</span>
                        <span className="font-bold text-green-600">
                          ${parseFloat(viewingCustomer.totalPurchases).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Orders:</span>
                        <span className="font-bold">{viewingCustomer.totalOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average Order Value:</span>
                        <span className="font-bold">
                          ${parseFloat(viewingCustomer.averageOrderValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Engagement</CardTitle>
                      <CardDescription>Customer activity timeline</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Member Since:</span>
                        <span className="font-medium">
                          {new Date(viewingCustomer.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Purchase:</span>
                        <span className="font-medium">
                          {viewingCustomer.lastPurchaseDate
                            ? new Date(viewingCustomer.lastPurchaseDate).toLocaleDateString()
                            : "Never"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Referral Code:</span>
                        <span className="font-mono text-sm">{viewingCustomer.referralCode || "—"}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
