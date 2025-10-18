import {
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type Inventory,
  type InsertInventory,
  type Customer,
  type InsertCustomer,
  type Sale,
  type InsertSale,
  type Commission,
  type InsertCommission,
  type DashboardStats,
  type SalesChainNode,
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { generateUsers, generateProducts, generateInventory, generateCustomers } from "./seedDataGenerator";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getRepresentatives(): Promise<User[]>;

  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  getInventory(id: string): Promise<Inventory | undefined>;
  getAllInventory(): Promise<Inventory[]>;
  getInventoryByProduct(productId: string): Promise<Inventory | undefined>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;
  updateInventory(id: string, updates: Partial<InsertInventory>): Promise<Inventory | undefined>;
  getLowStockInventory(): Promise<Inventory[]>;

  getCustomer(id: string): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  getCustomersByRep(repId: string): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;

  getSale(id: string): Promise<Sale | undefined>;
  getAllSales(): Promise<Sale[]>;
  getSalesByRep(repId: string): Promise<Sale[]>;
  getRecentSales(limit?: number): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;

  getCommission(id: string): Promise<Commission | undefined>;
  getAllCommissions(): Promise<Commission[]>;
  getCommissionsByRep(repId: string): Promise<Commission[]>;
  createCommission(commission: InsertCommission): Promise<Commission>;
  updateCommission(id: string, updates: Partial<InsertCommission>): Promise<Commission | undefined>;

  getDashboardStats(userId?: string): Promise<DashboardStats>;
  getSalesChain(): Promise<SalesChainNode[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private inventory: Map<string, Inventory>;
  private customers: Map<string, Customer>;
  private sales: Map<string, Sale>;
  private commissions: Map<string, Commission>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.inventory = new Map();
    this.customers = new Map();
    this.sales = new Map();
    this.commissions = new Map();
    this.seedData();
  }

  private async seedData() {
    console.log("🌱 Generating comprehensive seed data with 50 records each...");
    
    // Generate 50 users (1 admin + 49 representatives)
    const users = await generateUsers(50);
    users.forEach(user => this.users.set(user.id, user));
    console.log(`✅ Generated ${users.length} users`);
    
    // Generate 50 products
    const products = generateProducts(50);
    products.forEach(product => this.products.set(product.id, product));
    console.log(`✅ Generated ${products.length} products`);
    
    // Generate inventory for all products
    const inventoryItems = generateInventory(products);
    inventoryItems.forEach(inv => this.inventory.set(inv.id, inv));
    console.log(`✅ Generated ${inventoryItems.length} inventory items`);
    
    // Generate 50 customers
    const representatives = users.filter(u => u.role === "representative");
    const customers = generateCustomers(representatives, 50);
    customers.forEach(customer => this.customers.set(customer.id, customer));
    console.log(`✅ Generated ${customers.length} customers`);
    
    // Generate 100 sales transactions
    const productArray = Array.from(this.products.values());
    const customerArray = Array.from(this.customers.values());
    
    for (let i = 0; i < 100; i++) {
      const customer = customerArray[Math.floor(Math.random() * customerArray.length)];
      const product = productArray[Math.floor(Math.random() * productArray.length)];
      const quantity = Math.floor(Math.random() * 10) + 1;
      const unitPrice = parseFloat(product.basePrice);
      const subtotal = unitPrice * quantity;
      const discountAmount = subtotal * 0.05 * Math.random();
      const taxAmount = (subtotal - discountAmount) * 0.08;
      const totalAmount = subtotal - discountAmount + taxAmount;
      
      const rep = Array.from(this.users.values()).find((u) => u.id === customer.representativeId);
      const commissionRate = parseFloat(rep?.commissionRate || "10") / 100;
      const commissionAmount = (subtotal * commissionRate).toFixed(2);
      
      const saleDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000);

      const sale: Sale = {
        id: randomUUID(),
        productId: product.id,
        customerId: customer.id,
        representativeId: customer.representativeId,
        quantity,
        unitPrice: unitPrice.toFixed(2),
        subtotal: subtotal.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        commissionAmount,
        paymentMethod: ["Credit Card", "Bank Transfer", "PayPal", "Cash"][Math.floor(Math.random() * 4)],
        paymentStatus: Math.random() > 0.1 ? "paid" : "pending",
        transactionId: `TXN${randomUUID().substring(0, 8).toUpperCase()}`,
        shippingMethod: ["Standard", "Express", "Overnight", "Pickup"][Math.floor(Math.random() * 4)],
        shippingCost: (Math.random() * 20).toFixed(2),
        trackingNumber: Math.random() > 0.2 ? `TRK${Math.floor(Math.random() * 1000000000)}` : null,
        estimatedDelivery: new Date(saleDate.getTime() + (3 + Math.floor(Math.random() * 7)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actualDelivery: Math.random() > 0.3 ? new Date(saleDate.getTime() + (2 + Math.floor(Math.random() * 10)) * 24 * 60 * 60 * 1000) : null,
        status: ["completed", "pending", "shipped", "delivered"][Math.floor(Math.random() * 4)],
        notes: Math.random() > 0.7 ? "Customer requested express delivery" : null,
        createdAt: saleDate,
        updatedAt: new Date(),
      };

      this.sales.set(sale.id, sale);

      // Create commission for the sale
      const commission: Commission = {
        id: randomUUID(),
        representativeId: customer.representativeId,
        saleId: sale.id,
        amount: commissionAmount,
        percentage: (commissionRate * 100).toFixed(2),
        level: 1,
        status: Math.random() > 0.4 ? "paid" : "pending",
        paymentMethod: Math.random() > 0.5 ? "Bank Transfer" : "Check",
        paidAt: Math.random() > 0.4 ? new Date(saleDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null,
        notes: null,
        createdAt: saleDate,
      };

      this.commissions.set(commission.id, commission);
      
      // Create upline commissions (multi-level)
      if (rep && rep.uplineId) {
        const upline = this.users.get(rep.uplineId);
        if (upline) {
          const uplineCommissionRate = parseFloat(upline.commissionRate || "5") / 100;
          const uplineCommissionAmount = (subtotal * uplineCommissionRate * 0.5).toFixed(2);
          
          const uplineCommission: Commission = {
            id: randomUUID(),
            representativeId: upline.id,
            saleId: sale.id,
            amount: uplineCommissionAmount,
            percentage: (uplineCommissionRate * 50).toFixed(2),
            level: 2,
            status: Math.random() > 0.4 ? "paid" : "pending",
            paymentMethod: "Bank Transfer",
            paidAt: Math.random() > 0.4 ? new Date(saleDate.getTime() + 14 * 24 * 60 * 60 * 1000) : null,
            notes: "Upline commission",
            createdAt: saleDate,
          };
          
          this.commissions.set(uplineCommission.id, uplineCommission);
        }
      }
    }
    
    console.log(`✅ Generated 100 sales transactions with commissions`);
    console.log("✨ Seed data generation complete!");
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      id,
      username: insertUser.username,
      password: hashedPassword,
      email: insertUser.email,
      fullName: insertUser.fullName,
      role: insertUser.role,
      phone: insertUser.phone || null,
      alternatePhone: insertUser.alternatePhone || null,
      dateOfBirth: insertUser.dateOfBirth || null,
      gender: insertUser.gender || null,
      nationality: insertUser.nationality || null,
      languagesSpoken: insertUser.languagesSpoken || null,
      profilePicture: insertUser.profilePicture || null,
      address: insertUser.address || null,
      city: insertUser.city || null,
      state: insertUser.state || null,
      country: insertUser.country || null,
      postalCode: insertUser.postalCode || null,
      billingAddress: insertUser.billingAddress || null,
      shippingAddress: insertUser.shippingAddress || null,
      emergencyContactName: insertUser.emergencyContactName || null,
      emergencyContactPhone: insertUser.emergencyContactPhone || null,
      emergencyContactRelation: insertUser.emergencyContactRelation || null,
      bankName: insertUser.bankName || null,
      bankAccountNumber: insertUser.bankAccountNumber || null,
      bankRoutingNumber: insertUser.bankRoutingNumber || null,
      taxId: insertUser.taxId || null,
      socialSecurityNumber: insertUser.socialSecurityNumber || null,
      uplineId: insertUser.uplineId || null,
      commissionRate: insertUser.commissionRate || "10.00",
      enrollmentDate: insertUser.enrollmentDate || new Date().toISOString().split('T')[0],
      rankLevel: insertUser.rankLevel || "Bronze",
      totalSales: insertUser.totalSales || "0",
      totalCommissionsEarned: insertUser.totalCommissionsEarned || "0",
      teamSize: insertUser.teamSize || 0,
      personalSalesTarget: insertUser.personalSalesTarget || "10000",
      certifications: insertUser.certifications || null,
      trainingCompleted: insertUser.trainingCompleted || null,
      performanceRating: insertUser.performanceRating || null,
      preferredContactMethod: insertUser.preferredContactMethod || "email",
      timezone: insertUser.timezone || null,
      linkedinProfile: insertUser.linkedinProfile || null,
      facebookProfile: insertUser.facebookProfile || null,
      instagramHandle: insertUser.instagramHandle || null,
      notes: insertUser.notes || null,
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
      lastLoginAt: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    if (updates.password) {
      updatedUser.password = await bcrypt.hash(updates.password, 10);
    }
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getRepresentatives(): Promise<User[]> {
    return Array.from(this.users.values()).filter((u) => u.role === "representative");
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      id,
      brand: insertProduct.brand || null,
      name: insertProduct.name,
      length: insertProduct.length || null,
      isActive: insertProduct.isActive ?? true,
      createdAt: new Date(),
      description: insertProduct.description || null,
      category: insertProduct.category,
      subCategory: insertProduct.subCategory || null,
      manufacturer: insertProduct.manufacturer || null,
      model: insertProduct.model || null,
      sku: insertProduct.sku,
      barcode: insertProduct.barcode || null,
      upc: insertProduct.upc || null,
      costPrice: insertProduct.costPrice || "0",
      basePrice: insertProduct.basePrice,
      retailPrice: insertProduct.retailPrice || insertProduct.basePrice,
      wholesalePrice: insertProduct.wholesalePrice || insertProduct.basePrice,
      taxRate: insertProduct.taxRate || "0",
      weight: insertProduct.weight || "0",
      weightUnit: insertProduct.weightUnit || "kg",
      width: insertProduct.width || null,
      height: insertProduct.height || null,
      dimensionUnit: insertProduct.dimensionUnit || "cm",
      color: insertProduct.color || null,
      size: insertProduct.size || null,
      material: insertProduct.material || null,
      imageUrl: insertProduct.imageUrl || null,
      imageUrl2: insertProduct.imageUrl2 || null,
      imageUrl3: insertProduct.imageUrl3 || null,
      videoUrl: insertProduct.videoUrl || null,
      warrantyPeriod: insertProduct.warrantyPeriod || null,
      warrantyDetails: insertProduct.warrantyDetails || null,
      returnPolicy: insertProduct.returnPolicy || null,
      shippingClass: insertProduct.shippingClass || "Standard",
      fragile: insertProduct.fragile ?? false,
      perishable: insertProduct.perishable ?? false,
      hazardous: insertProduct.hazardous ?? false,
      supplierName: insertProduct.supplierName || null,
      supplierContact: insertProduct.supplierContact || null,
      supplierEmail: insertProduct.supplierEmail || null,
      leadTime: insertProduct.leadTime || null,
      minimumOrderQuantity: insertProduct.minimumOrderQuantity || 1,
      tags: insertProduct.tags || null,
      metaKeywords: insertProduct.metaKeywords || null,
      metaDescription: insertProduct.metaDescription || null,
      seoUrl: insertProduct.seoUrl || null,
      notes: insertProduct.notes || null,
      updatedAt: new Date(),
    };
    this.products.set(id, product);

    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async getInventory(id: string): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }

  async getAllInventory(): Promise<Inventory[]> {
    return Array.from(this.inventory.values());
  }

  async getInventoryByProduct(productId: string): Promise<Inventory | undefined> {
    return Array.from(this.inventory.values()).find((i) => i.productId === productId);
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    const id = randomUUID();
    const inventory: Inventory = {
      id,
      notes: insertInventory.notes || null,
      supplierName: insertInventory.supplierName || null,
      supplierContact: insertInventory.supplierContact || null,
      updatedAt: new Date(),
      productId: insertInventory.productId,
      quantity: insertInventory.quantity ?? 0,
      reservedQuantity: insertInventory.reservedQuantity || 0,
      availableQuantity: (insertInventory.quantity ?? 0) - (insertInventory.reservedQuantity || 0),
      reorderLevel: insertInventory.reorderLevel ?? 10,
      reorderQuantity: insertInventory.reorderQuantity ?? 50,
      maximumStock: insertInventory.maximumStock || 1000,
      warehouseLocation: insertInventory.warehouseLocation || null,
      aisle: insertInventory.aisle || null,
      shelf: insertInventory.shelf || null,
      bin: insertInventory.bin || null,
      lotNumber: insertInventory.lotNumber || null,
      serialNumber: insertInventory.serialNumber || null,
      expiryDate: insertInventory.expiryDate || null,
      manufacturingDate: insertInventory.manufacturingDate || null,
      lastRestocked: insertInventory.lastRestocked || null,
      lastSold: insertInventory.lastSold || null,
      lastCountDate: insertInventory.lastCountDate || null,
      damagedQuantity: insertInventory.damagedQuantity || 0,
      defectiveQuantity: insertInventory.defectiveQuantity || 0,
      returnedQuantity: insertInventory.returnedQuantity || 0,
      condition: insertInventory.condition || "New",
      stockValue: insertInventory.stockValue || "0",
    };
    this.inventory.set(id, inventory);
    return inventory;
  }

  async updateInventory(id: string, updates: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const inventory = this.inventory.get(id);
    if (!inventory) return undefined;

    const updatedInventory = { ...inventory, ...updates, updatedAt: new Date() };
    this.inventory.set(id, updatedInventory);
    return updatedInventory;
  }

  async getLowStockInventory(): Promise<Inventory[]> {
    return Array.from(this.inventory.values()).filter(
      (i) => i.quantity <= i.reorderLevel
    );
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomersByRep(repId: string): Promise<Customer[]> {
    return Array.from(this.customers.values()).filter(
      (c) => c.representativeId === repId
    );
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      id,
      representativeId: insertCustomer.representativeId,
      name: insertCustomer.name,
      email: insertCustomer.email,
      phone: insertCustomer.phone || null,
      alternatePhone: insertCustomer.alternatePhone || null,
      dateOfBirth: insertCustomer.dateOfBirth || null,
      gender: insertCustomer.gender || null,
      company: insertCustomer.company || null,
      jobTitle: insertCustomer.jobTitle || null,
      website: insertCustomer.website || null,
      industry: insertCustomer.industry || null,
      companySize: insertCustomer.companySize || null,
      billingStreet: insertCustomer.billingStreet || null,
      billingCity: insertCustomer.billingCity || null,
      billingState: insertCustomer.billingState || null,
      billingZipCode: insertCustomer.billingZipCode || null,
      billingCountry: insertCustomer.billingCountry || "USA",
      shippingStreet: insertCustomer.shippingStreet || null,
      shippingCity: insertCustomer.shippingCity || null,
      shippingState: insertCustomer.shippingState || null,
      shippingZipCode: insertCustomer.shippingZipCode || null,
      shippingCountry: insertCustomer.shippingCountry || "USA",
      taxId: insertCustomer.taxId || null,
      creditLimit: insertCustomer.creditLimit || null,
      paymentTerms: insertCustomer.paymentTerms || "Net 30",
      preferredPaymentMethod: insertCustomer.preferredPaymentMethod || null,
      preferredContactMethod: insertCustomer.preferredContactMethod || "email",
      language: insertCustomer.language || "English",
      timezone: insertCustomer.timezone || null,
      customPricing: insertCustomer.customPricing || null,
      discountPercentage: insertCustomer.discountPercentage || "0.00",
      loyaltyPoints: insertCustomer.loyaltyPoints || 0,
      customerTier: insertCustomer.customerTier || "Standard",
      firstPurchaseDate: insertCustomer.firstPurchaseDate || null,
      lastPurchaseDate: insertCustomer.lastPurchaseDate || null,
      totalPurchases: insertCustomer.totalPurchases || "0.00",
      totalOrders: insertCustomer.totalOrders || 0,
      averageOrderValue: insertCustomer.averageOrderValue || "0.00",
      referredBy: insertCustomer.referredBy || null,
      referralCode: insertCustomer.referralCode || null,
      tags: insertCustomer.tags || null,
      notes: insertCustomer.notes || null,
      source: insertCustomer.source || null,
      isActive: insertCustomer.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;

    const updatedCustomer = { ...customer, ...updates };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return this.customers.delete(id);
  }

  async getSale(id: string): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async getAllSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async getSalesByRep(repId: string): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter((s) => s.representativeId === repId);
  }

  async getRecentSales(limit: number = 30): Promise<Sale[]> {
    const cutoff = new Date(Date.now() - limit * 24 * 60 * 60 * 1000);
    return Array.from(this.sales.values())
      .filter((s) => s.createdAt >= cutoff)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = randomUUID();
    const sale: Sale = {
      id,
      notes: insertSale.notes || null,
      createdAt: new Date(),
      status: insertSale.status || "completed",
      updatedAt: new Date(),
      productId: insertSale.productId,
      quantity: insertSale.quantity,
      representativeId: insertSale.representativeId,
      customerId: insertSale.customerId,
      unitPrice: insertSale.unitPrice,
      subtotal: insertSale.subtotal || insertSale.totalAmount,
      discountAmount: insertSale.discountAmount || "0",
      taxAmount: insertSale.taxAmount || "0",
      totalAmount: insertSale.totalAmount,
      commissionAmount: insertSale.commissionAmount || "0",
      paymentMethod: insertSale.paymentMethod || "Cash",
      paymentStatus: insertSale.paymentStatus || "paid",
      transactionId: insertSale.transactionId || null,
      shippingMethod: insertSale.shippingMethod || null,
      shippingCost: insertSale.shippingCost || "0",
      trackingNumber: insertSale.trackingNumber || null,
      estimatedDelivery: insertSale.estimatedDelivery || null,
      actualDelivery: insertSale.actualDelivery || null,
    };
    this.sales.set(id, sale);

    const inventory = await this.getInventoryByProduct(sale.productId);
    if (inventory) {
      await this.updateInventory(inventory.id, {
        quantity: Math.max(0, inventory.quantity - sale.quantity),
      });
    }

    return sale;
  }

  async getCommission(id: string): Promise<Commission | undefined> {
    return this.commissions.get(id);
  }

  async getAllCommissions(): Promise<Commission[]> {
    return Array.from(this.commissions.values());
  }

  async getCommissionsByRep(repId: string): Promise<Commission[]> {
    return Array.from(this.commissions.values()).filter(
      (c) => c.representativeId === repId
    );
  }

  async createCommission(insertCommission: InsertCommission): Promise<Commission> {
    const id = randomUUID();
    const commission: Commission = {
      id,
      notes: insertCommission.notes || null,
      createdAt: new Date(),
      status: insertCommission.status || "pending",
      representativeId: insertCommission.representativeId,
      paymentMethod: insertCommission.paymentMethod || null,
      saleId: insertCommission.saleId,
      amount: insertCommission.amount,
      percentage: insertCommission.percentage || "10",
      level: insertCommission.level,
      paidAt: insertCommission.paidAt || null,
    };
    this.commissions.set(id, commission);
    return commission;
  }

  async updateCommission(id: string, updates: Partial<InsertCommission>): Promise<Commission | undefined> {
    const commission = this.commissions.get(id);
    if (!commission) return undefined;

    const updatedCommission = { ...commission, ...updates };
    this.commissions.set(id, updatedCommission);
    return updatedCommission;
  }

  async getDashboardStats(userId?: string): Promise<DashboardStats> {
    const sales = userId
      ? await this.getSalesByRep(userId)
      : await this.getAllSales();

    const commissions = userId
      ? await this.getCommissionsByRep(userId)
      : await this.getAllCommissions();

    const totalSales = sales.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0);
    const totalCommissions = commissions.reduce(
      (sum, c) => sum + parseFloat(c.amount),
      0
    );

    const activeRepresentatives = Array.from(this.users.values()).filter(
      (u) => u.role === "representative" && u.isActive
    ).length;

    const activeCustomers = userId
      ? (await this.getCustomersByRep(userId)).filter((c) => c.isActive).length
      : Array.from(this.customers.values()).filter((c) => c.isActive).length;

    const lowStockProducts = (await this.getLowStockInventory()).length;

    const recentSales = (await this.getRecentSales()).filter((s) =>
      userId ? s.representativeId === userId : true
    ).length;

    return {
      totalSales,
      totalCommissions,
      activeRepresentatives,
      activeCustomers,
      lowStockProducts,
      recentSales,
    };
  }

  async getSalesChain(): Promise<SalesChainNode[]> {
    const reps = await this.getRepresentatives();
    const topLevelReps = reps.filter((r) => !r.uplineId);

    const buildNode = async (rep: User): Promise<SalesChainNode> => {
      const sales = await this.getSalesByRep(rep.id);
      const commissions = await this.getCommissionsByRep(rep.id);
      const downline = reps.filter((r) => r.uplineId === rep.id);

      const totalSales = sales.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0);
      const totalCommissions = commissions.reduce(
        (sum, c) => sum + parseFloat(c.amount),
        0
      );

      const children = await Promise.all(downline.map((d) => buildNode(d)));

      return {
        id: rep.id,
        name: rep.fullName,
        role: rep.role,
        totalSales,
        totalCommissions,
        downlineCount: downline.length,
        children,
      };
    };

    return Promise.all(topLevelReps.map((rep) => buildNode(rep)));
  }
}

export const storage = new MemStorage();
