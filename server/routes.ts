import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type {
  User,
  InsertUser,
  InsertProduct,
  InsertCustomer,
  InsertSale,
  AIRecommendation,
} from "@shared/schema";
import {
  insertUserSchema,
  insertProductSchema,
  insertCustomerSchema,
  insertSaleSchema,
} from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key-change-in-production";

interface AuthRequest extends Request {
  user?: User;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await storage.getUser(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginSchema = z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      });

      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error });
      }

      const { username, password } = validation.data;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/representatives", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const representatives = await storage.getRepresentatives();
      const repsWithoutPassword = representatives.map(({ password, ...rest }) => rest);
      res.json(repsWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/representatives", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error });
      }

      const representative = await storage.createUser(validation.data);
      const { password: _, ...repWithoutPassword } = representative;
      res.json(repWithoutPassword);

      broadcastUpdate({ type: "representative_created", data: repWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/representatives/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const validation = insertUserSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error });
      }

      const representative = await storage.updateUser(req.params.id, validation.data);
      if (!representative) {
        return res.status(404).json({ error: "Representative not found" });
      }
      const { password: _, ...repWithoutPassword } = representative;
      res.json(repWithoutPassword);

      broadcastUpdate({ type: "representative_updated", data: repWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/representatives/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Representative not found" });
      }
      res.json({ success: true });

      broadcastUpdate({ type: "representative_deleted", data: { id: req.params.id } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const validation = insertProductSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error });
      }

      const product = await storage.createProduct(validation.data);
      res.json(product);

      broadcastUpdate({ type: "product_created", data: product });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/products/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const validation = insertProductSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error });
      }

      const product = await storage.updateProduct(req.params.id, validation.data);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);

      broadcastUpdate({ type: "product_updated", data: product });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });

      broadcastUpdate({ type: "product_deleted", data: { id: req.params.id } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/inventory", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const inventory = await storage.getAllInventory();
      const products = await storage.getAllProducts();

      const inventoryWithProducts = inventory.map((inv) => ({
        ...inv,
        product: products.find((p) => p.id === inv.productId),
      }));

      res.json(inventoryWithProducts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/inventory/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const inventoryUpdateSchema = z.object({
        quantity: z.number().optional(),
        reorderLevel: z.number().optional(),
      });

      const validation = inventoryUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error });
      }

      const inventory = await storage.updateInventory(req.params.id, validation.data);
      if (!inventory) {
        return res.status(404).json({ error: "Inventory not found" });
      }
      res.json(inventory);

      broadcastUpdate({ type: "inventory_updated", data: inventory });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/inventory/low-stock", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const lowStock = await storage.getLowStockInventory();
      const products = await storage.getAllProducts();

      const lowStockWithProducts = lowStock.map((inv) => ({
        ...inv,
        product: products.find((p) => p.id === inv.productId),
      }));

      res.json(lowStockWithProducts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/customers", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const customers =
        req.user?.role === "admin"
          ? await storage.getAllCustomers()
          : await storage.getCustomersByRep(req.user!.id);

      const representatives = await storage.getRepresentatives();

      const customersWithReps = customers.map((customer) => ({
        ...customer,
        representative: representatives.find((r) => r.id === customer.representativeId),
      }));

      res.json(customersWithReps);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rep/customers", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const customers = await storage.getCustomersByRep(req.user!.id);
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/customers", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const validation = insertCustomerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error });
      }

      const customer = await storage.createCustomer(validation.data);
      res.json(customer);

      broadcastUpdate({ type: "customer_created", data: customer });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/customers/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const validation = insertCustomerSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error });
      }

      const customer = await storage.updateCustomer(req.params.id, validation.data);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);

      broadcastUpdate({ type: "customer_updated", data: customer });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/customers/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteCustomer(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json({ success: true });

      broadcastUpdate({ type: "customer_deleted", data: { id: req.params.id } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sales/recent", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const sales = await storage.getRecentSales();
      const products = await storage.getAllProducts();
      const customers = await storage.getAllCustomers();

      const salesWithDetails = sales.map((sale) => ({
        ...sale,
        product: products.find((p) => p.id === sale.productId),
        customer: customers.find((c) => c.id === sale.customerId),
      }));

      res.json(salesWithDetails);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rep/sales", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const sales = await storage.getSalesByRep(req.user!.id);
      const products = await storage.getAllProducts();
      const customers = await storage.getCustomersByRep(req.user!.id);

      const salesWithDetails = sales.map((sale) => ({
        ...sale,
        product: products.find((p) => p.id === sale.productId),
        customer: customers.find((c) => c.id === sale.customerId),
      }));

      res.json(salesWithDetails);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/sales", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const validation = insertSaleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error });
      }

      const saleData = validation.data;

      const sale = await storage.createSale(saleData);

      const commission = await storage.createCommission({
        representativeId: saleData.representativeId,
        saleId: sale.id,
        amount: saleData.commissionAmount,
        level: 1,
        status: "pending",
        paidAt: null,
      });

      res.json(sale);

      broadcastUpdate({ type: "sale_created", data: sale });
      broadcastUpdate({ type: "commission_created", data: commission });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rep/commissions", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const commissions = await storage.getCommissionsByRep(req.user!.id);
      res.json(commissions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/stats", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rep/stats", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getDashboardStats(req.user!.id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sales-chain", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const chain = await storage.getSalesChain();
      res.json(chain);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/ai/recommendations", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const recommendations = await generateAIRecommendations("admin");
      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/ai/recommendations/rep", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const recommendations = await generateAIRecommendations("representative", req.user);
      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    console.log("WebSocket client connected");

    ws.on("message", (message: string) => {
      console.log("Received:", message.toString());
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });

    ws.send(JSON.stringify({ type: "connected", message: "WebSocket connected" }));
  });

  function broadcastUpdate(update: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(update));
      }
    });
  }

  return httpServer;
}

async function generateAIRecommendations(
  role: string,
  user?: User
): Promise<AIRecommendation[]> {
  const recommendations: AIRecommendation[] = [];

  if (role === "admin") {
    recommendations.push({
      type: "pricing",
      title: "Optimize Product Pricing",
      description:
        "Consider increasing the price of Premium Widget by 5-10% based on recent demand patterns and competitor analysis.",
      confidence: 87,
      action: "Review Pricing",
    });

    recommendations.push({
      type: "sales",
      title: "Sales Performance Opportunity",
      description:
        "Representatives in the Northeast region show 15% higher conversion rates. Consider expanding team there.",
      confidence: 92,
      action: "View Analytics",
    });

    recommendations.push({
      type: "product",
      title: "Stock Reorder Suggestion",
      description:
        "Essential Kit inventory is projected to run low within 7 days based on current sales velocity.",
      confidence: 94,
      action: "Restock Now",
    });
  } else {
    recommendations.push({
      type: "lead",
      title: "High-Value Lead Opportunity",
      description:
        "Alice Johnson has shown interest in premium products. Schedule a follow-up call this week.",
      confidence: 85,
      action: "Contact Customer",
    });

    recommendations.push({
      type: "product",
      title: "Cross-Sell Recommendation",
      description:
        "Customers who bought Premium Widget typically purchase Deluxe Gadget within 30 days. Target recent buyers.",
      confidence: 78,
      action: "View Suggestions",
    });

    recommendations.push({
      type: "sales",
      title: "Optimal Contact Time",
      description:
        "Your customers respond best to calls between 2-4 PM on Tuesdays and Thursdays.",
      confidence: 82,
    });
  }

  return recommendations;
}
