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
    const adminPassword = await bcrypt.hash("admin123", 10);
    const repPassword = await bcrypt.hash("rep123", 10);

    const admin: User = {
      id: randomUUID(),
      username: "admin",
      email: "admin@mlm.com",
      fullName: "Admin User",
      password: adminPassword,
      role: "admin",
      phone: "+1234567890",
      uplineId: null,
      commissionRate: "0",
      isActive: true,
      createdAt: new Date(),
    };

    const rep1: User = {
      id: randomUUID(),
      username: "rep1",
      email: "rep1@mlm.com",
      fullName: "John Smith",
      password: repPassword,
      role: "representative",
      phone: "+1234567891",
      uplineId: null,
      commissionRate: "10.00",
      isActive: true,
      createdAt: new Date(),
    };

    const rep2: User = {
      id: randomUUID(),
      username: "rep2",
      email: "rep2@mlm.com",
      fullName: "Sarah Johnson",
      password: repPassword,
      role: "representative",
      phone: "+1234567892",
      uplineId: rep1.id,
      commissionRate: "10.00",
      isActive: true,
      createdAt: new Date(),
    };

    this.users.set(admin.id, admin);
    this.users.set(rep1.id, rep1);
    this.users.set(rep2.id, rep2);

    const products = [
      {
        id: randomUUID(),
        name: "Premium Widget",
        description: "High-quality widget for all your needs",
        category: "Electronics",
        basePrice: "99.99",
        sku: "WIDGET-001",
        imageUrl: null,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Deluxe Gadget",
        description: "Advanced gadget with multiple features",
        category: "Electronics",
        basePrice: "149.99",
        sku: "GADGET-001",
        imageUrl: null,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Essential Kit",
        description: "Everything you need in one package",
        category: "Health",
        basePrice: "79.99",
        sku: "KIT-001",
        imageUrl: null,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    products.forEach((p) => {
      this.products.set(p.id, p);
      const inv: Inventory = {
        id: randomUUID(),
        productId: p.id,
        quantity: Math.floor(Math.random() * 100) + 20,
        reorderLevel: 10,
        lastRestocked: new Date(),
        updatedAt: new Date(),
      };
      this.inventory.set(inv.id, inv);
    });

    const customers = [
      {
        id: randomUUID(),
        representativeId: rep1.id,
        name: "Alice Johnson",
        email: "alice@example.com",
        phone: "+1234567893",
        address: "123 Main St, City, State",
        customPricing: null,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        representativeId: rep1.id,
        name: "Bob Williams",
        email: "bob@example.com",
        phone: "+1234567894",
        address: "456 Oak Ave, City, State",
        customPricing: null,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        representativeId: rep2.id,
        name: "Carol Davis",
        email: "carol@example.com",
        phone: "+1234567895",
        address: "789 Pine St, City, State",
        customPricing: null,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    customers.forEach((c) => this.customers.set(c.id, c));

    const productArray = Array.from(this.products.values());
    const customerArray = Array.from(this.customers.values());

    for (let i = 0; i < 10; i++) {
      const customer = customerArray[Math.floor(Math.random() * customerArray.length)];
      const product = productArray[Math.floor(Math.random() * productArray.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const unitPrice = parseFloat(product.basePrice);
      const totalAmount = (unitPrice * quantity).toFixed(2);
      const rep = Array.from(this.users.values()).find((u) => u.id === customer.representativeId);
      const commissionRate = parseFloat(rep?.commissionRate || "10") / 100;
      const commissionAmount = (parseFloat(totalAmount) * commissionRate).toFixed(2);

      const sale: Sale = {
        id: randomUUID(),
        productId: product.id,
        customerId: customer.id,
        representativeId: customer.representativeId,
        quantity,
        unitPrice: unitPrice.toFixed(2),
        totalAmount,
        commissionAmount,
        status: "completed",
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      };

      this.sales.set(sale.id, sale);

      const commission: Commission = {
        id: randomUUID(),
        representativeId: customer.representativeId,
        saleId: sale.id,
        amount: commissionAmount,
        level: 1,
        status: Math.random() > 0.3 ? "paid" : "pending",
        paidAt: Math.random() > 0.3 ? new Date() : null,
        createdAt: sale.createdAt,
      };

      this.commissions.set(commission.id, commission);
    }
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
      uplineId: insertUser.uplineId || null,
      commissionRate: insertUser.commissionRate || "10.00",
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
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
      name: insertProduct.name,
      description: insertProduct.description || null,
      category: insertProduct.category,
      basePrice: insertProduct.basePrice,
      sku: insertProduct.sku,
      imageUrl: insertProduct.imageUrl || null,
      isActive: insertProduct.isActive ?? true,
      createdAt: new Date(),
    };
    this.products.set(id, product);

    const inventory: Inventory = {
      id: randomUUID(),
      productId: id,
      quantity: 0,
      reorderLevel: 10,
      lastRestocked: null,
      updatedAt: new Date(),
    };
    this.inventory.set(inventory.id, inventory);

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
      productId: insertInventory.productId,
      quantity: insertInventory.quantity ?? 0,
      reorderLevel: insertInventory.reorderLevel ?? 10,
      lastRestocked: insertInventory.lastRestocked || null,
      updatedAt: new Date(),
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
      address: insertCustomer.address || null,
      customPricing: insertCustomer.customPricing || null,
      isActive: insertCustomer.isActive ?? true,
      createdAt: new Date(),
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
      productId: insertSale.productId,
      customerId: insertSale.customerId,
      representativeId: insertSale.representativeId,
      quantity: insertSale.quantity,
      unitPrice: insertSale.unitPrice,
      totalAmount: insertSale.totalAmount,
      commissionAmount: insertSale.commissionAmount,
      status: insertSale.status || "completed",
      createdAt: new Date(),
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
      representativeId: insertCommission.representativeId,
      saleId: insertCommission.saleId,
      amount: insertCommission.amount,
      level: insertCommission.level,
      status: insertCommission.status || "pending",
      paidAt: insertCommission.paidAt || null,
      createdAt: new Date(),
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
