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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, InsertUser } from "@shared/schema";

export default function Representatives() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRep, setEditingRep] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<InsertUser>>({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    password: "",
    role: "representative",
    commissionRate: "10.00",
    isActive: true,
    rankLevel: "Bronze",
    preferredContactMethod: "email",
  });

  const { data: representatives, isLoading } = useQuery<User[]>({
    queryKey: ["/api/representatives"],
  });

  const { data: allReps } = useQuery<User[]>({
    queryKey: ["/api/representatives"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertUser) => apiRequest("POST", "/api/representatives", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/representatives"] });
      toast({ title: "Representative created successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create representative",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertUser> }) =>
      apiRequest("PATCH", `/api/representatives/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/representatives"] });
      toast({ title: "Representative updated successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update representative",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/representatives/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/representatives"] });
      toast({ title: "Representative deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete representative",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      fullName: "",
      phone: "",
      password: "",
      role: "representative",
      commissionRate: "10.00",
      isActive: true,
      rankLevel: "Bronze",
      preferredContactMethod: "email",
    });
    setEditingRep(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRep) {
      updateMutation.mutate({ id: editingRep.id, data: formData });
    } else {
      createMutation.mutate(formData as InsertUser);
    }
  };

  const handleEdit = (rep: User) => {
    setEditingRep(rep);
    setFormData({
      username: rep.username,
      email: rep.email,
      fullName: rep.fullName,
      phone: rep.phone || "",
      alternatePhone: rep.alternatePhone || "",
      dateOfBirth: rep.dateOfBirth || "",
      gender: rep.gender || "",
      nationality: rep.nationality || "",
      languagesSpoken: rep.languagesSpoken || "",
      profilePicture: rep.profilePicture || "",
      address: rep.address || "",
      city: rep.city || "",
      state: rep.state || "",
      country: rep.country || "",
      postalCode: rep.postalCode || "",
      billingAddress: rep.billingAddress || "",
      shippingAddress: rep.shippingAddress || "",
      emergencyContactName: rep.emergencyContactName || "",
      emergencyContactPhone: rep.emergencyContactPhone || "",
      emergencyContactRelation: rep.emergencyContactRelation || "",
      bankName: rep.bankName || "",
      bankAccountNumber: rep.bankAccountNumber || "",
      bankRoutingNumber: rep.bankRoutingNumber || "",
      taxId: rep.taxId || "",
      socialSecurityNumber: rep.socialSecurityNumber || "",
      uplineId: rep.uplineId || "",
      commissionRate: rep.commissionRate || "10.00",
      enrollmentDate: rep.enrollmentDate || "",
      rankLevel: rep.rankLevel || "Bronze",
      totalSales: rep.totalSales || "0",
      totalCommissionsEarned: rep.totalCommissionsEarned || "0",
      teamSize: rep.teamSize || 0,
      personalSalesTarget: rep.personalSalesTarget || "10000",
      certifications: rep.certifications || "",
      trainingCompleted: rep.trainingCompleted || "",
      performanceRating: rep.performanceRating || "",
      preferredContactMethod: rep.preferredContactMethod || "email",
      timezone: rep.timezone || "",
      linkedinProfile: rep.linkedinProfile || "",
      facebookProfile: rep.facebookProfile || "",
      instagramHandle: rep.instagramHandle || "",
      notes: rep.notes || "",
      isActive: rep.isActive,
      role: "representative",
    });
    setIsDialogOpen(true);
  };

  const columns = [
    { key: "fullName", label: "Name", sortable: true },
    { key: "username", label: "Username", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone" },
    { key: "rankLevel", label: "Rank", render: (rep: User) => <Badge variant="outline">{rep.rankLevel}</Badge> },
    {
      key: "commissionRate",
      label: "Commission",
      render: (rep: User) => (
        <span className="font-mono">{rep.commissionRate}%</span>
      ),
    },
    {
      key: "totalSales",
      label: "Total Sales",
      render: (rep: User) => (
        <span className="font-mono">${parseFloat(rep.totalSales || "0").toFixed(2)}</span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (rep: User) => (
        <Badge variant={rep.isActive ? "default" : "secondary"}>
          {rep.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (rep: User) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(rep)}
            data-testid={`button-edit-${rep.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteMutation.mutate(rep.id)}
            data-testid={`button-delete-${rep.id}`}
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
          <h1 className="text-3xl font-bold tracking-tight">Representatives</h1>
          <p className="text-muted-foreground mt-1">
            Manage your sales representatives
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-representative">
          <Plus className="h-4 w-4 mr-2" />
          Add Representative
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <DataTable
          data={representatives || []}
          columns={columns}
          searchPlaceholder="Search representatives..."
          emptyMessage="No representatives found"
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRep ? "Edit Representative" : "Add Representative"}
            </DialogTitle>
            <DialogDescription>
              {editingRep
                ? "Update representative information"
                : "Create a new sales representative with comprehensive details"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="mlm">MLM/Career</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="additional">Additional</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      data-testid="input-fullname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      disabled={!!editingRep}
                      data-testid="input-username"
                    />
                  </div>
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
                  {!editingRep && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        data-testid="input-password"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality || ""}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      data-testid="input-nationality"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="languagesSpoken">Languages Spoken</Label>
                  <Input
                    id="languagesSpoken"
                    placeholder="e.g., English, Spanish, French"
                    value={formData.languagesSpoken || ""}
                    onChange={(e) => setFormData({ ...formData, languagesSpoken: e.target.value })}
                    data-testid="input-languages"
                  />
                </div>
              </TabsContent>

              {/* Contact Information Tab */}
              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    data-testid="input-address"
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city || ""}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      data-testid="input-city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state || ""}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      data-testid="input-state"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode || ""}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      data-testid="input-postal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country || ""}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      data-testid="input-country"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold">Emergency Contact</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={formData.emergencyContactName || ""}
                        onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                        data-testid="input-emergency-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        type="tel"
                        value={formData.emergencyContactPhone || ""}
                        onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                        data-testid="input-emergency-phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactRelation">Relation</Label>
                      <Input
                        id="emergencyContactRelation"
                        value={formData.emergencyContactRelation || ""}
                        onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                        data-testid="input-emergency-relation"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                    <Select value={formData.preferredContactMethod || "email"} onValueChange={(value) => setFormData({ ...formData, preferredContactMethod: value })}>
                      <SelectTrigger data-testid="select-contact-method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="text">Text Message</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      placeholder="e.g., EST, PST, UTC+5"
                      value={formData.timezone || ""}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      data-testid="input-timezone"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* MLM/Career Information Tab */}
              <TabsContent value="mlm" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="uplineId">Upline Representative</Label>
                    <Select value={formData.uplineId || ""} onValueChange={(value) => setFormData({ ...formData, uplineId: value })}>
                      <SelectTrigger data-testid="select-upline">
                        <SelectValue placeholder="Select upline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {allReps?.filter(r => r.id !== editingRep?.id).map(rep => (
                          <SelectItem key={rep.id} value={rep.id}>{rep.fullName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                    <Input
                      id="enrollmentDate"
                      type="date"
                      value={formData.enrollmentDate || ""}
                      onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                      data-testid="input-enrollment-date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rankLevel">Rank Level</Label>
                    <Select value={formData.rankLevel || "Bronze"} onValueChange={(value) => setFormData({ ...formData, rankLevel: value })}>
                      <SelectTrigger data-testid="select-rank">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bronze">Bronze</SelectItem>
                        <SelectItem value="Silver">Silver</SelectItem>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Platinum">Platinum</SelectItem>
                        <SelectItem value="Diamond">Diamond</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      step="0.01"
                      value={formData.commissionRate || "10.00"}
                      onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                      required
                      data-testid="input-commission"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Team Size</Label>
                    <Input
                      id="teamSize"
                      type="number"
                      value={formData.teamSize || 0}
                      onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || 0 })}
                      data-testid="input-team-size"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="personalSalesTarget">Personal Sales Target</Label>
                    <Input
                      id="personalSalesTarget"
                      type="number"
                      step="0.01"
                      value={formData.personalSalesTarget || "10000"}
                      onChange={(e) => setFormData({ ...formData, personalSalesTarget: e.target.value })}
                      data-testid="input-sales-target"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="performanceRating">Performance Rating</Label>
                    <Select value={formData.performanceRating || ""} onValueChange={(value) => setFormData({ ...formData, performanceRating: value })}>
                      <SelectTrigger data-testid="select-performance">
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Average">Average</SelectItem>
                        <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea
                    id="certifications"
                    placeholder="List any certifications or qualifications"
                    value={formData.certifications || ""}
                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    rows={2}
                    data-testid="input-certifications"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trainingCompleted">Training Completed</Label>
                  <Textarea
                    id="trainingCompleted"
                    placeholder="List completed training programs"
                    value={formData.trainingCompleted || ""}
                    onChange={(e) => setFormData({ ...formData, trainingCompleted: e.target.value })}
                    rows={2}
                    data-testid="input-training"
                  />
                </div>
              </TabsContent>

              {/* Financial Information Tab */}
              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName || ""}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      data-testid="input-bank-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber">Account Number</Label>
                    <Input
                      id="bankAccountNumber"
                      type="password"
                      value={formData.bankAccountNumber || ""}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                      data-testid="input-account-number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankRoutingNumber">Routing Number</Label>
                    <Input
                      id="bankRoutingNumber"
                      value={formData.bankRoutingNumber || ""}
                      onChange={(e) => setFormData({ ...formData, bankRoutingNumber: e.target.value })}
                      data-testid="input-routing-number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID / EIN</Label>
                    <Input
                      id="taxId"
                      value={formData.taxId || ""}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      data-testid="input-tax-id"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Billing Address (if different)</Label>
                  <Input
                    id="billingAddress"
                    value={formData.billingAddress || ""}
                    onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                    data-testid="input-billing-address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingAddress">Shipping Address (if different)</Label>
                  <Input
                    id="shippingAddress"
                    value={formData.shippingAddress || ""}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    data-testid="input-shipping-address"
                  />
                </div>
              </TabsContent>

              {/* Additional Information Tab */}
              <TabsContent value="additional" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                  <Input
                    id="linkedinProfile"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedinProfile || ""}
                    onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
                    data-testid="input-linkedin"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebookProfile">Facebook Profile</Label>
                    <Input
                      id="facebookProfile"
                      placeholder="https://facebook.com/..."
                      value={formData.facebookProfile || ""}
                      onChange={(e) => setFormData({ ...formData, facebookProfile: e.target.value })}
                      data-testid="input-facebook"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagramHandle">Instagram Handle</Label>
                    <Input
                      id="instagramHandle"
                      placeholder="@username"
                      value={formData.instagramHandle || ""}
                      onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                      data-testid="input-instagram"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture URL</Label>
                  <Input
                    id="profilePicture"
                    placeholder="https://..."
                    value={formData.profilePicture || ""}
                    onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                    data-testid="input-profile-pic"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this representative"
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
                  <Label htmlFor="isActive" className="cursor-pointer">Active Status</Label>
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
                {editingRep ? "Update Representative" : "Create Representative"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
