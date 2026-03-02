const mongoose = require("mongoose");
const Product = require("./models/product-model"); // Adjust path if your model is somewhere else
require("dotenv").config(); // Assuming you have a .env file with MONGO_URI

const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Kaya";

const seedProducts = [
  // --- MEN'S ---
  {
    name: "Classic White Khadi Kurta",
    brand: "Kaya Originals",
    description: "A breathable, authentic white Khadi kurta perfect for daily wear and festive occasions.",
    category: "Khadi Kurta",
    fabricType: "Pure Khadi",
    color: "White",
    pattern: "Plain",
    size: "L",
    price: 1200,
    discountPrice: 999,
    stock: 50,
    images: [{ url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKVhvdlj_qK2Vw2Yjz9Dx5J_aj803EzngGKQ&s" }],
    materialOrigin: "Kalpi",
    handwoven: true,
    isFeatured: true,
    tags: ["mens", "kurta", "white", "summer"]
  },
  {
    name: "Royal Blue Nehru Jacket",
    brand: "Kaya Handlooms",
    description: "Handwoven Khadi Nehru jacket, ideal for layering over kurtas.",
    category: "Nehru Jacket (Khadi)",
    fabricType: "Heavy Khadi Cotton",
    color: "Royal Blue",
    pattern: "Textured",
    size: "M",
    price: 1800,
    stock: 30,
    images: [{ url: "https://images.unsplash.com/photo-1593030761756-1d1dd681123f?q=80&w=1000&auto=format&fit=crop" }],
    materialOrigin: "Varanasi",
    handwoven: true,
    isFeatured: false,
    tags: ["mens", "jacket", "wedding"]
  },

  // --- WOMEN'S ---
  {
    name: "Crimson Handwoven Saree",
    brand: "Kaya Heritage",
    description: "A stunning crimson red handwoven saree with intricate border detailing.",
    category: "Handwoven Sarees",
    fabricType: "Cotton Silk Blend",
    color: "Crimson Red",
    pattern: "Traditional Border",
    size: "6.5 Meters",
    price: 3500,
    discountPrice: 2999,
    stock: 15,
    images: [{ url: "https://images.unsplash.com/photo-1610030469983-98e550d615ef?q=80&w=1000&auto=format&fit=crop" }],
    materialOrigin: "Kalpi",
    handwoven: true,
    isFeatured: true,
    tags: ["womens", "saree", "festive"]
  },
  {
    name: "Mint Green Khadi Kurti",
    brand: "Kaya Everyday",
    description: "Lightweight and breathable mint green kurti for comfortable office wear.",
    category: "Khadi Kurtis",
    fabricType: "Khadi Cotton",
    color: "Mint Green",
    pattern: "Solid",
    size: "S",
    price: 850,
    stock: 100,
    images: [{ url: "https://images.unsplash.com/photo-1583391733958-65e2be105b4a?q=80&w=1000&auto=format&fit=crop" }],
    materialOrigin: "Kalpi",
    handwoven: true,
    isFeatured: false,
    tags: ["womens", "kurti", "summer"]
  },

  // --- UNISEX & SUSTAINABLE (Including Gamcha) ---
 
  {
    name: "Charcoal Minimalist Stole",
    brand: "Kaya Basics",
    description: "A soft, charcoal grey stole that pairs perfectly with any modern or ethnic outfit.",
    category: "Stoles",
    fabricType: "Organic Cotton",
    color: "Charcoal Grey",
    pattern: "Plain",
    size: "2 Meters",
    price: 450,
    stock: 60,
    images: [{ url: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=1000&auto=format&fit=crop" }],
    materialOrigin: "Kalpi",
    handwoven: true,
    isFeatured: false,
    tags: ["unisex", "accessories", "winter"]
  },

  // --- FABRICS ---
  {
    name: "Unstitched Pure Khadi Roll",
    brand: "Kaya Looms",
    description: "Premium unstitched pure Khadi fabric roll, sold by the meter. Perfect for custom tailoring.",
    category: "Pure Khadi",
    fabricType: "100% Khadi",
    color: "Off-White",
    pattern: "Natural Weave",
    size: "By Meter",
    price: 300,
    stock: 1000,
    images: [{ url: "https://images.unsplash.com/photo-1598114660301-83161c8d203e?q=80&w=1000&auto=format&fit=crop" }],
    materialOrigin: "Kalpi",
    handwoven: true,
    isFeatured: false,
    tags: ["fabric", "raw material", "wholesale"]
  },
  {
    name: "Golden Chanderi Fabric",
    brand: "Kaya Looms",
    description: "Lustrous Chanderi fabric with a subtle golden sheen, ideal for festive garments.",
    category: "Chanderi",
    fabricType: "Chanderi Silk Cotton",
    color: "Gold",
    pattern: "Plain with Sheen",
    size: "By Meter",
    price: 650,
    stock: 200,
    images: [{ url: "https://images.unsplash.com/photo-1605289982774-9a6fef564df8?q=80&w=1000&auto=format&fit=crop" }],
    materialOrigin: "Chanderi",
    handwoven: true,
    isFeatured: true,
    tags: ["fabric", "festive", "premium"]
  },

  // --- OCCASIONS & ACCESSORIES ---
  {
    name: "Indigo Potli Bag",
    brand: "Kaya Accessories",
    description: "Handcrafted indigo dyed potli bag with traditional drawstrings.",
    category: "Potli Bags",
    fabricType: "Cotton Canvas",
    color: "Indigo Blue",
    pattern: "Printed",
    size: "Free Size",
    price: 350,
    stock: 45,
    images: [{ url: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1000&auto=format&fit=crop" }],
    materialOrigin: "Kalpi",
    handwoven: false,
    isFeatured: false,
    tags: ["accessories", "bags", "indigo"]
  },
  {
    name: "Ivory Wedding Collection Kurta Set",
    brand: "Kaya Exclusive",
    description: "Luxurious ivory kurta pajama set designed specifically for weddings and grand events.",
    category: "Wedding Collection",
    fabricType: "Silk Blend Khadi",
    color: "Ivory",
    pattern: "Self-Embroidered",
    size: "XL",
    price: 4500,
    discountPrice: 3999,
    stock: 20,
    images: [{ url: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=1000&auto=format&fit=crop" }],
    materialOrigin: "Varanasi",
    handwoven: true,
    isFeatured: true,
    tags: ["wedding", "mens", "premium"]
  }
];

const seedDB = async () => {
  try {
   await mongoose.connect(dbURI);
    console.log(" Connected to MongoDB");

    // Clear existing products so we don't get duplicates
    await Product.deleteMany({});
    console.log(" Cleared existing products");

    // Insert the seed data
    await Product.insertMany(seedProducts);
    console.log(" Successfully seeded Kaya products!");

    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(" Error seeding database:", err);
    process.exit(1);
  }
};

seedDB();