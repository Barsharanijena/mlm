import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(),
  phone: text("phone"),
  alternatePhone: text("alternate_phone"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  nationality: text("nationality"),
  
  // Address Information
  street: text("street"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country").default("USA"),
  
  // Professional Information
  employeeId: text("employee_id"),
  department: text("department"),
  territory: text("territory"),
  joinDate: text("join_date"),
  employmentType: text("employment_type"),
  
  // Financial Information
  socialSecurityNumber: text("ssn"),
  taxId: text("tax_id"),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  routingNumber: text("routing_number"),
  
  // Emergency Contact
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactRelationship: text("emergency_contact_relationship"),
  
  // Professional Details
  languages: text("languages"),
  certifications: text("certifications"),
  education: text("education"),
  experience: text("experience"),
  profilePictureUrl: text("profile_picture_url"),
  
  // MLM Specific
  uplineId: varchar("upline_id"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("10.00"),
  totalSales: decimal("total_sales", { precision: 12, scale: 2 }).default("0.00"),
  totalCommissions: decimal("total_commissions", { precision: 12, scale: 2 }).default("0.00"),
  performanceLevel: text("performance_level").default("Bronze"),
  rank: text("rank"),
  teamSize: integer("team_size").default(0),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Basic Information
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  subCategory: text("sub_category"),
  brand: text("brand"),
  manufacturer: text("manufacturer"),
  model: text("model"),
  
  // Identification
  sku: text("sku").notNull().unique(),
  barcode: text("barcode"),
  upc: text("upc"),
  
  // Pricing
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  retailPrice: decimal("retail_price", { precision: 10, scale: 2 }),
  wholesalePrice: decimal("wholesale_price", { precision: 10, scale: 2 }),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0.00"),
  
  // Physical Attributes
  weight: decimal("weight", { precision: 8, scale: 2 }),
  weightUnit: text("weight_unit").default("kg"),
  length: decimal("length", { precision: 8, scale: 2 }),
  width: decimal("width", { precision: 8, scale: 2 }),
  height: decimal("height", { precision: 8, scale: 2 }),
  dimensionUnit: text("dimension_unit").default("cm"),
  color: text("color"),
  size: text("size"),
  material: text("material"),
  
  // Supplier Information
  supplierName: text("supplier_name"),
  supplierContact: text("supplier_contact"),
  supplierEmail: text("supplier_email"),
  leadTime: integer("lead_time"),
  
  // Product Details
  warrantyPeriod: text("warranty_period"),
  minOrderQuantity: integer("min_order_quantity").default(1),
  maxOrderQuantity: integer("max_order_quantity"),
  expiryDate: text("expiry_date"),
  
  // Marketing
  imageUrl: text("image_url"),
  images: jsonb("images").default('[]'),
  videoUrl: text("video_url"),
  tags: text("tags"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").default(0),
  
  // Additional Information
  specifications: jsonb("specifications").default('{}'),
  features: text("features"),
  usage: text("usage"),
  warnings: text("warnings"),
  relatedProducts: text("related_products"),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false),
  isDiscountEligible: boolean("is_discount_eligible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  
  // Stock Information
  quantity: integer("quantity").notNull().default(0),
  reservedQuantity: integer("reserved_quantity").default(0),
  availableQuantity: integer("available_quantity").default(0),
  damagedQuantity: integer("damaged_quantity").default(0),
  inTransitQuantity: integer("in_transit_quantity").default(0),
  
  // Reorder Management
  reorderLevel: integer("reorder_level").notNull().default(10),
  reorderQuantity: integer("reorder_quantity").default(50),
  minimumOrderQuantity: integer("minimum_order_quantity").default(10),
  
  // Location
  warehouseLocation: text("warehouse_location"),
  warehouseSection: text("warehouse_section"),
  binLocation: text("bin_location"),
  shelfNumber: text("shelf_number"),
  
  // Supplier Information
  supplierName: text("supplier_name"),
  supplierContact: text("supplier_contact"),
  costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }),
  
  // Dates
  lastRestocked: timestamp("last_restocked"),
  lastOrderDate: timestamp("last_order_date"),
  nextRestockDate: timestamp("next_restock_date"),
  lastStockCheck: timestamp("last_stock_check"),
  
  // Analytics
  averageSalesPerMonth: integer("average_sales_per_month").default(0),
  turnoverRate: decimal("turnover_rate", { precision: 5, scale: 2 }).default("0.00"),
  stockValue: decimal("stock_value", { precision: 12, scale: 2 }).default("0.00"),
  
  // Status
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  representativeId: varchar("representative_id").notNull(),
  
  // Basic Information
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  alternatePhone: text("alternate_phone"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  
  // Company Information
  company: text("company"),
  jobTitle: text("job_title"),
  website: text("website"),
  industry: text("industry"),
  companySize: text("company_size"),
  
  // Address Information
  billingStreet: text("billing_street"),
  billingCity: text("billing_city"),
  billingState: text("billing_state"),
  billingZipCode: text("billing_zip_code"),
  billingCountry: text("billing_country").default("USA"),
  
  shippingStreet: text("shipping_street"),
  shippingCity: text("shipping_city"),
  shippingState: text("shipping_state"),
  shippingZipCode: text("shipping_zip_code"),
  shippingCountry: text("shipping_country").default("USA"),
  
  // Financial Information
  taxId: text("tax_id"),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }),
  paymentTerms: text("payment_terms").default("Net 30"),
  preferredPaymentMethod: text("preferred_payment_method"),
  
  // Customer Preferences
  preferredContactMethod: text("preferred_contact_method").default("email"),
  language: text("language").default("English"),
  timezone: text("timezone"),
  
  // MLM Specific
  customPricing: text("custom_pricing"),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0.00"),
  loyaltyPoints: integer("loyalty_points").default(0),
  customerTier: text("customer_tier").default("Standard"),
  
  // Purchase History
  firstPurchaseDate: timestamp("first_purchase_date"),
  lastPurchaseDate: timestamp("last_purchase_date"),
  totalPurchases: decimal("total_purchases", { precision: 12, scale: 2 }).default("0.00"),
  totalOrders: integer("total_orders").default(0),
  averageOrderValue: decimal("average_order_value", { precision: 10, scale: 2 }).default("0.00"),
  
  // Referral
  referredBy: text("referred_by"),
  referralCode: text("referral_code"),
  
  // Additional Information
  tags: text("tags"),
  notes: text("notes"),
  source: text("source"),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  customerId: varchar("customer_id").notNull(),
  representativeId: varchar("representative_id").notNull(),
  
  // Sale Details
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Payment Information
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").default("pending"),
  transactionId: text("transaction_id"),
  
  // Delivery Information
  shippingMethod: text("shipping_method"),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0.00"),
  trackingNumber: text("tracking_number"),
  estimatedDelivery: text("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  
  // Status
  status: text("status").notNull().default("completed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const commissions = pgTable("commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  representativeId: varchar("representative_id").notNull(),
  saleId: varchar("sale_id").notNull(),
  
  // Commission Details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  level: integer("level").notNull(),
  
  // Payment Information
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  paidAt: timestamp("paid_at"),
  
  // Tracking
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;

export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type Commission = typeof commissions.$inferSelect;

export type UserRole = "admin" | "representative" | "customer";

// Dashboard Stats
export interface DashboardStats {
  totalSales: string;
  totalRevenue: string;
  totalCommissions: string;
  activeRepresentatives: number;
  totalCustomers: number;
  lowStockProducts: number;
  pendingCommissions: string;
  thisMonthSales: string;
  salesGrowth: number;
  topPerformers: Array<{
    id: string;
    name: string;
    sales: string;
    commissions: string;
  }>;
}

// Sales Chain Node
export interface SalesChainNode {
  id: string;
  name: string;
  level: number;
  uplineId: string | null;
  totalSales: string;
  teamSize: number;
  children: SalesChainNode[];
}

// AI Recommendation
export interface AIRecommendation {
  type: "product" | "pricing" | "sales" | "inventory";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  actionable: boolean;
  relatedData?: any;
}
