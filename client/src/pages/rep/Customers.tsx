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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Customer, InsertCustomer } from "@shared/schema";

export default function RepCustomers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<InsertCustomer>>({
    name: "",
    email: "",
    phone: "",
    representativeId: user?.id || "",
    isActive: true,
    billingCountry: "USA",
    shippingCountry: "USA",
    preferredContactMethod: "email",
    language: "English",
    paymentTerms: "Net 30",
    customerTier: "Standard",
  });

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/rep/customers"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertCustomer) => apiRequest("POST", "/api/customers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rep/customers"] });
      toast({ title: "Customer created successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create customer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertCustomer> }) =>
      apiRequest("PATCH", `/api/customers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rep/customers"] });
      toast({ title: "Customer updated successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/customers/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rep/customers"] });
      toast({ title: "Customer deleted successfully" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      representativeId: user?.id || "",
      isActive: true,
      billingCountry: "USA",
      shippingCountry: "USA",
      preferredContactMethod: "email",
      language: "English",
      paymentTerms: "Net 30",
      customerTier: "Standard",
    });
    setEditingCustomer(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = { ...formData, representativeId: user?.id || "" };
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit as InsertCustomer);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      alternatePhone: customer.alternatePhone || "",
      dateOfBirth: customer.dateOfBirth || "",
      gender: customer.gender || "",
      company: customer.company || "",
      jobTitle: customer.jobTitle || "",
      website: customer.website || "",
      industry: customer.industry || "",
      companySize: customer.companySize || "",
      billingStreet: customer.billingStreet || "",
      billingCity: customer.billingCity || "",
      billingState: customer.billingState || "",
      billingZipCode: customer.billingZipCode || "",
      billingCountry: customer.billingCountry || "USA",
      shippingStreet: customer.shippingStreet || "",
      shippingCity: customer.shippingCity || "",
      shippingState: customer.shippingState || "",
      shippingZipCode: customer.shippingZipCode || "",
      shippingCountry: customer.shippingCountry || "USA",
      taxId: customer.taxId || "",
      creditLimit: customer.creditLimit || "",
      paymentTerms: customer.paymentTerms || "Net 30",
      preferredPaymentMethod: customer.preferredPaymentMethod || "",
      preferredContactMethod: customer.preferredContactMethod || "email",
      language: customer.language || "English",
      timezone: customer.timezone || "",
      customPricing: customer.customPricing || "",
      discountPercentage: customer.discountPercentage || "",
      loyaltyPoints: customer.loyaltyPoints || 0,
      customerTier: customer.customerTier || "Standard",
      referredBy: customer.referredBy || "",
      referralCode: customer.referralCode || "",
      tags: customer.tags || "",
      notes: customer.notes || "",
      source: customer.source || "",
      isActive: customer.isActive,
      representativeId: customer.representativeId,
    });
    setIsDialogOpen(true);
  };

  const columns = [
    { key: "name", label: "Customer Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone" },
    { 
      key: "company", 
      label: "Company",
      render: (customer: Customer) => customer.company || "—"
    },
    {
      key: "customerTier",
      label: "Tier",
      render: (customer: Customer) => <Badge variant="outline">{customer.customerTier}</Badge>,
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
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(customer)}
            data-testid={`button-edit-${customer.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteMutation.mutate(customer.id)}
            data-testid={`button-delete-${customer.id}`}
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
          <h1 className="text-3xl font-bold tracking-tight">My Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage comprehensive customer information and relationships
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-customer">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add Customer"}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer
                ? "Update comprehensive customer information"
                : "Create a new customer with detailed information"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="additional">Additional</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Primary Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alternatePhone">Alternate Phone</Label>
                    <Input
                      id="alternatePhone"
                      type="tel"
                      value={formData.alternatePhone || ""}
                      onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                      data-testid="input-alt-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth || ""}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      data-testid="input-dob"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender || ""} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger data-testid="select-gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredContactMethod">Preferred Contact</Label>
                    <Select value={formData.preferredContactMethod || "email"} onValueChange={(value) => setFormData({ ...formData, preferredContactMethod: value })}>
                      <SelectTrigger data-testid="select-contact-method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="mail">Mail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={formData.language || "English"} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                      <SelectTrigger data-testid="select-language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="Mandarin">Mandarin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Company Information Tab */}
              <TabsContent value="company" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={formData.company || ""}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      data-testid="input-company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle || ""}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      data-testid="input-job-title"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={formData.industry || ""} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                      <SelectTrigger data-testid="select-industry">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Services">Services</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select value={formData.companySize || ""} onValueChange={(value) => setFormData({ ...formData, companySize: value })}>
                      <SelectTrigger data-testid="select-company-size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="500+">500+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://"
                    value={formData.website || ""}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    data-testid="input-website"
                  />
                </div>
              </TabsContent>

              {/* Addresses Tab */}
              <TabsContent value="addresses" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-semibold">Billing Address</h4>
                  <div className="space-y-2">
                    <Label htmlFor="billingStreet">Street Address</Label>
                    <Input
                      id="billingStreet"
                      value={formData.billingStreet || ""}
                      onChange={(e) => setFormData({ ...formData, billingStreet: e.target.value })}
                      data-testid="input-billing-street"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingCity">City</Label>
                      <Input
                        id="billingCity"
                        value={formData.billingCity || ""}
                        onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                        data-testid="input-billing-city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingState">State</Label>
                      <Input
                        id="billingState"
                        value={formData.billingState || ""}
                        onChange={(e) => setFormData({ ...formData, billingState: e.target.value })}
                        data-testid="input-billing-state"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingZipCode">Zip Code</Label>
                      <Input
                        id="billingZipCode"
                        value={formData.billingZipCode || ""}
                        onChange={(e) => setFormData({ ...formData, billingZipCode: e.target.value })}
                        data-testid="input-billing-zip"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingCountry">Country</Label>
                      <Input
                        id="billingCountry"
                        value={formData.billingCountry || "USA"}
                        onChange={(e) => setFormData({ ...formData, billingCountry: e.target.value })}
                        data-testid="input-billing-country"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold">Shipping Address</h4>
                  <div className="space-y-2">
                    <Label htmlFor="shippingStreet">Street Address</Label>
                    <Input
                      id="shippingStreet"
                      value={formData.shippingStreet || ""}
                      onChange={(e) => setFormData({ ...formData, shippingStreet: e.target.value })}
                      data-testid="input-shipping-street"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shippingCity">City</Label>
                      <Input
                        id="shippingCity"
                        value={formData.shippingCity || ""}
                        onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                        data-testid="input-shipping-city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingState">State</Label>
                      <Input
                        id="shippingState"
                        value={formData.shippingState || ""}
                        onChange={(e) => setFormData({ ...formData, shippingState: e.target.value })}
                        data-testid="input-shipping-state"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingZipCode">Zip Code</Label>
                      <Input
                        id="shippingZipCode"
                        value={formData.shippingZipCode || ""}
                        onChange={(e) => setFormData({ ...formData, shippingZipCode: e.target.value })}
                        data-testid="input-shipping-zip"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingCountry">Country</Label>
                      <Input
                        id="shippingCountry"
                        value={formData.shippingCountry || "USA"}
                        onChange={(e) => setFormData({ ...formData, shippingCountry: e.target.value })}
                        data-testid="input-shipping-country"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Financial Information Tab */}
              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="creditLimit">Credit Limit ($)</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      step="0.01"
                      value={formData.creditLimit || ""}
                      onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                      data-testid="input-credit-limit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      value={formData.taxId || ""}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      data-testid="input-tax-id"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select value={formData.paymentTerms || "Net 30"} onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}>
                      <SelectTrigger data-testid="select-payment-terms">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                        <SelectItem value="Net 90">Net 90</SelectItem>
                        <SelectItem value="COD">COD</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredPaymentMethod">Preferred Payment Method</Label>
                    <Select value={formData.preferredPaymentMethod || ""} onValueChange={(value) => setFormData({ ...formData, preferredPaymentMethod: value })}>
                      <SelectTrigger data-testid="select-payment-method">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Check">Check</SelectItem>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold">MLM & Loyalty</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerTier">Customer Tier</Label>
                      <Select value={formData.customerTier || "Standard"} onValueChange={(value) => setFormData({ ...formData, customerTier: value })}>
                        <SelectTrigger data-testid="select-tier">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Silver">Silver</SelectItem>
                          <SelectItem value="Gold">Gold</SelectItem>
                          <SelectItem value="Platinum">Platinum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountPercentage">Discount (%)</Label>
                      <Input
                        id="discountPercentage"
                        type="number"
                        step="0.01"
                        value={formData.discountPercentage || ""}
                        onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                        data-testid="input-discount"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loyaltyPoints">Loyalty Points</Label>
                      <Input
                        id="loyaltyPoints"
                        type="number"
                        value={formData.loyaltyPoints || 0}
                        onChange={(e) => setFormData({ ...formData, loyaltyPoints: parseInt(e.target.value) || 0 })}
                        data-testid="input-loyalty-points"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customPricing">Custom Pricing Notes</Label>
                    <Textarea
                      id="customPricing"
                      value={formData.customPricing || ""}
                      onChange={(e) => setFormData({ ...formData, customPricing: e.target.value })}
                      rows={2}
                      data-testid="input-custom-pricing"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Additional Information Tab */}
              <TabsContent value="additional" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="referredBy">Referred By</Label>
                    <Input
                      id="referredBy"
                      value={formData.referredBy || ""}
                      onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                      data-testid="input-referred-by"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referralCode">Referral Code</Label>
                    <Input
                      id="referralCode"
                      value={formData.referralCode || ""}
                      onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                      data-testid="input-referral-code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source">Lead Source</Label>
                    <Select value={formData.source || ""} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                      <SelectTrigger data-testid="select-source">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Trade Show">Trade Show</SelectItem>
                        <SelectItem value="Cold Call">Cold Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      placeholder="e.g., EST, PST"
                      value={formData.timezone || ""}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      data-testid="input-timezone"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="vip, wholesale, frequent"
                    value={formData.tags || ""}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    data-testid="input-tags"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this customer"
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
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
                  <Label htmlFor="isActive" className="cursor-pointer">Active Customer</Label>
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
                {editingCustomer ? "Update Customer" : "Create Customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
