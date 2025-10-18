import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import type { User, Product, Inventory, Customer, Sale, Commission } from "@shared/schema";

// Sample data arrays
const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle", "Kenneth", "Carol", "Kevin", "Amanda", "Brian", "Dorothy", "George", "Melissa", "Timothy", "Deborah"];

const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"];

const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", "Seattle", "Denver", "Boston", "Nashville", "Detroit", "Portland", "Memphis", "Oklahoma City", "Las Vegas", "Louisville", "Baltimore", "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento", "Kansas City", "Long Beach", "Mesa", "Atlanta", "Colorado Springs", "Virginia Beach", "Raleigh", "Omaha", "Miami", "Oakland", "Minneapolis", "Tulsa", "Wichita", "New Orleans"];

const states = ["NY", "CA", "IL", "TX", "AZ", "PA", "TX", "CA", "TX", "CA", "TX", "FL", "TX", "OH", "NC", "CA", "IN", "WA", "CO", "MA", "TN", "MI", "OR", "TN", "OK", "NV", "KY", "MD", "WI", "NM", "AZ", "CA", "CA", "MO", "CA", "AZ", "GA", "CO", "VA", "NC", "NE", "FL", "CA", "MN", "OK", "KS", "LA"];

const streets = ["Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Pine Rd", "Elm St", "Washington Blvd", "Lake View Dr", "Park Ave", "River Rd", "Hill St", "Forest Dr", "Meadow Ln", "Sunset Blvd", "Broadway", "Market St", "Church St", "School Rd", "Mill St", "Spring St"];

const companyTypes = ["Tech Solutions", "Global Industries", "Enterprises Inc", "Corporation", "LLC", "Group", "International", "Systems", "Services", "Consulting"];

const productCategories = ["Electronics", "Health & Wellness", "Beauty", "Home & Garden", "Sports & Fitness", "Automotive", "Office Supplies", "Pet Care", "Fashion", "Toys & Games"];

const productBrands = ["ProTech", "HealthPlus", "BeautyPro", "HomeCare", "FitLife", "AutoMax", "OfficeEase", "PetLove", "StyleHub", "PlayTime", "EliteChoice", "PureEssence", "SmartLife", "EcoFriend", "Premium"];

const territories = ["Northeast", "Southeast", "Midwest", "Southwest", "West Coast", "Pacific Northwest", "Mountain", "Great Lakes", "Central", "Atlantic"];

const departments = ["Sales", "Marketing", "Operations", "Customer Service", "Business Development", "Regional Management", "Territory Management", "Account Management"];

const performanceLevels = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];

const ranks = ["Associate", "Senior Associate", "Manager", "Senior Manager", "Director", "Senior Director", "VP", "Senior VP"];

// Helper functions
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min: number, max: number, decimals: number = 2): string {
  const value = Math.random() * (max - min) + min;
  return value.toFixed(decimals);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generatePhone(): string {
  return `+1${randomInt(200, 999)}${randomInt(200, 999)}${randomInt(1000, 9999)}`;
}

function generateSSN(): string {
  return `${randomInt(100, 999)}-${randomInt(10, 99)}-${randomInt(1000, 9999)}`;
}

function generateEmail(firstName: string, lastName: string, domain: string = "example.com"): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

export async function generateUsers(count: number = 50): Promise<User[]> {
  const users: User[] = [];
  const password = await bcrypt.hash("rep123", 10);
  
  // Admin
  users.push({
    id: randomUUID(),
    username: "admin",
    password: await bcrypt.hash("admin123", 10),
    email: "admin@mlm.com",
    fullName: "Admin User",
    role: "admin",
    phone: generatePhone(),
    alternatePhone: generatePhone(),
    dateOfBirth: "1985-06-15",
    gender: "Male",
    nationality: "American",
    street: "100 Executive Plaza",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA",
    employeeId: "EMP001",
    department: "Administration",
    territory: "Corporate",
    joinDate: "2020-01-01",
    employmentType: "Full-time",
    socialSecurityNumber: generateSSN(),
    taxId: `TAX${randomInt(100000, 999999)}`,
    bankName: "Chase Bank",
    bankAccountNumber: `${randomInt(1000000000, 9999999999)}`,
    routingNumber: "021000021",
    emergencyContactName: "Jane Admin",
    emergencyContactPhone: generatePhone(),
    emergencyContactRelationship: "Spouse",
    languages: "English, Spanish",
    certifications: "MBA, CPA",
    education: "Master's Degree",
    experience: "15+ years",
    profilePictureUrl: null,
    uplineId: null,
    commissionRate: "0",
    totalSales: "0",
    totalCommissions: "0",
    performanceLevel: "Executive",
    rank: "CEO",
    teamSize: 0,
    isActive: true,
    notes: "System Administrator",
    createdAt: new Date("2020-01-01"),
    lastLoginAt: new Date(),
  });
  
  // Generate representatives
  for (let i = 1; i < count; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const fullName = `${firstName} ${lastName}`;
    const city = randomElement(cities);
    const state = randomElement(states);
    const joinYear = randomInt(2020, 2024);
    const joinMonth = randomInt(1, 12);
    const joinDate = new Date(joinYear, joinMonth - 1, randomInt(1, 28));
    
    const user: User = {
      id: randomUUID(),
      username: `rep${i}`,
      password,
      email: generateEmail(firstName, lastName, "mlm.com"),
      fullName,
      role: "representative",
      phone: generatePhone(),
      alternatePhone: Math.random() > 0.5 ? generatePhone() : null,
      dateOfBirth: `${randomInt(1970, 1995)}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
      gender: randomElement(["Male", "Female", "Other"]),
      nationality: randomElement(["American", "Canadian", "Mexican", "Other"]),
      street: `${randomInt(100, 9999)} ${randomElement(streets)}`,
      city,
      state,
      zipCode: `${randomInt(10000, 99999)}`,
      country: "USA",
      employeeId: `EMP${String(i + 1).padStart(3, '0')}`,
      department: randomElement(departments),
      territory: randomElement(territories),
      joinDate: joinDate.toISOString().split('T')[0],
      employmentType: randomElement(["Full-time", "Part-time", "Contract"]),
      socialSecurityNumber: generateSSN(),
      taxId: `TAX${randomInt(100000, 999999)}`,
      bankName: randomElement(["Chase", "Bank of America", "Wells Fargo", "Citibank", "US Bank"]),
      bankAccountNumber: `${randomInt(1000000000, 9999999999)}`,
      routingNumber: `0${randomInt(10000000, 99999999)}`,
      emergencyContactName: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
      emergencyContactPhone: generatePhone(),
      emergencyContactRelationship: randomElement(["Spouse", "Parent", "Sibling", "Friend"]),
      languages: randomElement(["English", "English, Spanish", "English, French", "English, Mandarin"]),
      certifications: randomElement(["Sales Certified", "MLM Pro", "Business Development", "None"]),
      education: randomElement(["High School", "Bachelor's Degree", "Master's Degree", "Associate Degree"]),
      experience: `${randomInt(1, 15)} years`,
      profilePictureUrl: null,
      uplineId: i > 10 ? users[randomInt(1, i - 1)].id : (i > 1 ? users[1].id : null),
      commissionRate: randomDecimal(5, 20, 2),
      totalSales: randomDecimal(10000, 500000, 2),
      totalCommissions: randomDecimal(1000, 50000, 2),
      performanceLevel: randomElement(performanceLevels),
      rank: randomElement(ranks),
      teamSize: randomInt(0, 20),
      isActive: Math.random() > 0.1,
      notes: Math.random() > 0.7 ? "Top performer" : null,
      createdAt: joinDate,
      lastLoginAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
    };
    
    users.push(user);
  }
  
  return users;
}

export function generateProducts(count: number = 50): Product[] {
  const products: Product[] = [];
  
  const productNames = [
    "Premium Vitamin C Serum", "Ultra HD Smartwatch", "Organic Green Tea Extract", "Professional Hair Dryer",
    "Wireless Bluetooth Earbuds", "Anti-Aging Night Cream", "Protein Powder Chocolate", "Yoga Mat Premium",
    "LED Desk Lamp", "Portable Phone Charger", "Essential Oil Diffuser", "Memory Foam Pillow",
    "Stainless Steel Water Bottle", "Resistance Bands Set", "Coffee Maker Deluxe", "Air Purifier HEPA",
    "Massage Gun Pro", "Smart Scale Digital", "Blender High Speed", "Fitness Tracker Band",
    "Laptop Stand Ergonomic", "Webcam HD 1080p", "Mechanical Keyboard", "Gaming Mouse RGB",
    "Noise Cancelling Headphones", "Portable Speaker Waterproof", "Car Phone Mount", "Dash Cam 4K",
    "Pet GPS Tracker", "Cat Litter Box Automatic", "Dog Training Collar", "Aquarium Filter System",
    "Plant Grow Light LED", "Garden Tool Set", "BBQ Grill Set", "Camping Tent 4-Person",
    "Hiking Backpack 50L", "Sleeping Bag Winter", "Folding Chair Portable", "Cooler Wheeled",
    "Kitchen Knife Set", "Cookware Set Nonstick", "Food Processor Multi", "Toaster Oven Convection",
    "Electric Kettle", "Rice Cooker Smart", "Slow Cooker Programmable", "Vacuum Sealer Machine",
    "Wine Opener Electric", "Spice Rack Organizer"
  ];
  
  for (let i = 0; i < count && i < productNames.length; i++) {
    const name = productNames[i];
    const category = randomElement(productCategories);
    const brand = randomElement(productBrands);
    const costPrice = parseFloat(randomDecimal(10, 200, 2));
    const basePrice = costPrice * parseFloat(randomDecimal(1.5, 3, 2));
    
    const product: Product = {
      id: randomUUID(),
      name,
      description: `High-quality ${name.toLowerCase()} with advanced features and premium materials. Perfect for professionals and enthusiasts alike.`,
      category,
      subCategory: randomElement(["Premium", "Standard", "Economy", "Professional", "Home Use"]),
      brand,
      manufacturer: `${brand} Manufacturing`,
      model: `${brand.substring(0, 3).toUpperCase()}-${randomInt(1000, 9999)}`,
      sku: `SKU${String(i + 1).padStart(5, '0')}`,
      barcode: `${randomInt(100000000000, 999999999999)}`,
      upc: `${randomInt(100000000000, 999999999999)}`,
      costPrice: costPrice.toFixed(2),
      basePrice: basePrice.toFixed(2),
      retailPrice: (basePrice * 1.2).toFixed(2),
      wholesalePrice: (basePrice * 0.9).toFixed(2),
      taxRate: randomDecimal(0, 10, 2),
      weight: randomDecimal(0.1, 50, 2),
      weightUnit: "kg",
      length: randomDecimal(5, 100, 2),
      width: randomDecimal(5, 100, 2),
      height: randomDecimal(5, 100, 2),
      dimensionUnit: "cm",
      color: randomElement(["Black", "White", "Silver", "Blue", "Red", "Green", "Gray", "Multi"]),
      size: randomElement(["Small", "Medium", "Large", "XL", "One Size", "Universal"]),
      material: randomElement(["Plastic", "Metal", "Glass", "Wood", "Fabric", "Composite", "Silicone"]),
      supplierName: `${randomElement(productBrands)} Suppliers Ltd`,
      supplierContact: generatePhone(),
      supplierEmail: `supplier${i}@suppliers.com`,
      leadTime: randomInt(7, 60),
      warrantyPeriod: randomElement(["1 year", "2 years", "3 years", "Lifetime", "90 days"]),
      minOrderQuantity: randomInt(1, 10),
      maxOrderQuantity: randomInt(100, 1000),
      expiryDate: Math.random() > 0.8 ? new Date(Date.now() + randomInt(30, 730) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      imageUrl: null,
      images: [],
      videoUrl: null,
      tags: randomElement(["bestseller", "new", "premium", "sale", "featured"]),
      rating: randomDecimal(3.5, 5, 2),
      reviewCount: randomInt(0, 500),
      specifications: {},
      features: `• High quality materials\n• Easy to use\n• Long-lasting\n• Great value`,
      usage: `Ideal for ${randomElement(["daily use", "professional use", "home use", "commercial use"])}`,
      warnings: "Keep away from children. Follow instructions carefully.",
      relatedProducts: null,
      isActive: Math.random() > 0.05,
      isFeatured: Math.random() > 0.7,
      isDiscountEligible: Math.random() > 0.3,
      createdAt: randomDate(new Date(2020, 0, 1), new Date()),
      updatedAt: new Date(),
    };
    
    products.push(product);
  }
  
  return products;
}

export function generateInventory(products: Product[]): Inventory[] {
  return products.map(product => {
    const quantity = randomInt(0, 500);
    const costPerUnit = parseFloat(product.costPrice || "0");
    
    return {
      id: randomUUID(),
      productId: product.id,
      quantity,
      reservedQuantity: randomInt(0, Math.min(quantity, 20)),
      availableQuantity: quantity - randomInt(0, Math.min(quantity, 20)),
      damagedQuantity: randomInt(0, 5),
      inTransitQuantity: randomInt(0, 50),
      reorderLevel: randomInt(10, 50),
      reorderQuantity: randomInt(50, 200),
      minimumOrderQuantity: parseInt(product.minOrderQuantity?.toString() || "10"),
      warehouseLocation: randomElement(["Warehouse A", "Warehouse B", "Warehouse C", "Distribution Center"]),
      warehouseSection: randomElement(["Section 1", "Section 2", "Section 3", "Section 4"]),
      binLocation: `${randomElement(["A", "B", "C", "D"])}-${randomInt(1, 20)}-${randomInt(1, 10)}`,
      shelfNumber: `S-${randomInt(100, 999)}`,
      supplierName: product.supplierName || "Generic Supplier",
      supplierContact: product.supplierContact || generatePhone(),
      costPerUnit: costPerUnit.toFixed(2),
      lastRestocked: randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()),
      lastOrderDate: randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date()),
      nextRestockDate: randomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      lastStockCheck: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
      averageSalesPerMonth: randomInt(10, 100),
      turnoverRate: randomDecimal(0.5, 5, 2),
      stockValue: (quantity * costPerUnit).toFixed(2),
      notes: Math.random() > 0.7 ? "Fast moving item" : null,
      updatedAt: new Date(),
    };
  });
}

export function generateCustomers(representatives: User[], count: number = 50): Customer[] {
  const customers: Customer[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const name = `${firstName} ${lastName}`;
    const company = Math.random() > 0.3 ? `${randomElement(lastNames)} ${randomElement(companyTypes)}` : null;
    const city = randomElement(cities);
    const state = randomElement(states);
    const rep = randomElement(representatives.filter(u => u.role === "representative"));
    const joinDate = randomDate(new Date(2020, 0, 1), new Date());
    
    const customer: Customer = {
      id: randomUUID(),
      representativeId: rep.id,
      name,
      email: generateEmail(firstName, lastName),
      phone: generatePhone(),
      alternatePhone: Math.random() > 0.6 ? generatePhone() : null,
      dateOfBirth: `${randomInt(1950, 2000)}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
      gender: randomElement(["Male", "Female", "Other", "Prefer not to say"]),
      company,
      jobTitle: company ? randomElement(["CEO", "Manager", "Director", "VP Sales", "Buyer", "Owner"]) : null,
      website: company ? `www.${company.toLowerCase().replace(/\s+/g, '')}.com` : null,
      industry: company ? randomElement(["Technology", "Healthcare", "Retail", "Manufacturing", "Services"]) : null,
      companySize: company ? randomElement(["1-10", "11-50", "51-200", "201-500", "500+"]) : null,
      billingStreet: `${randomInt(100, 9999)} ${randomElement(streets)}`,
      billingCity: city,
      billingState: state,
      billingZipCode: `${randomInt(10000, 99999)}`,
      billingCountry: "USA",
      shippingStreet: Math.random() > 0.5 ? `${randomInt(100, 9999)} ${randomElement(streets)}` : `${randomInt(100, 9999)} ${randomElement(streets)}`,
      shippingCity: Math.random() > 0.5 ? city : randomElement(cities),
      shippingState: Math.random() > 0.5 ? state : randomElement(states),
      shippingZipCode: `${randomInt(10000, 99999)}`,
      shippingCountry: "USA",
      taxId: company ? `TAX${randomInt(100000, 999999)}` : null,
      creditLimit: randomDecimal(1000, 50000, 2),
      paymentTerms: randomElement(["Net 30", "Net 60", "Net 90", "COD", "Credit Card"]),
      preferredPaymentMethod: randomElement(["Credit Card", "Bank Transfer", "Check", "PayPal"]),
      preferredContactMethod: randomElement(["email", "phone", "text", "mail"]),
      language: randomElement(["English", "Spanish", "French", "Mandarin"]),
      timezone: randomElement(["EST", "CST", "MST", "PST"]),
      customPricing: null,
      discountPercentage: randomDecimal(0, 15, 2),
      loyaltyPoints: randomInt(0, 10000),
      customerTier: randomElement(["Standard", "Silver", "Gold", "Platinum"]),
      firstPurchaseDate: joinDate,
      lastPurchaseDate: randomDate(joinDate, new Date()),
      totalPurchases: randomDecimal(500, 50000, 2),
      totalOrders: randomInt(1, 100),
      averageOrderValue: randomDecimal(100, 2000, 2),
      referredBy: Math.random() > 0.7 ? randomElement(firstNames) : null,
      referralCode: `REF${randomInt(10000, 99999)}`,
      tags: randomElement(["vip", "wholesale", "retail", "frequent"]),
      notes: Math.random() > 0.8 ? "Excellent customer" : null,
      source: randomElement(["Website", "Referral", "Social Media", "Trade Show", "Cold Call"]),
      isActive: Math.random() > 0.1,
      createdAt: joinDate,
      updatedAt: new Date(),
    };
    
    customers.push(customer);
  }
  
  return customers;
}
