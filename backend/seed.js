const mongoose = require("mongoose");
const Product = require("./models/product-model");
require("dotenv").config();

const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Kaya";

const seedProducts = [
  // ──────────────────────────────────────────────────────────────
  // MEN'S — Timeless & Sophisticated
  // ──────────────────────────────────────────────────────────────
  {
    name: "White Khadi Kurta",
    brand: "Kaya Heritage",
    description: "Bathed in the soft glow of tradition, this pure white Khadi kurta is handwoven in the serene villages of Kalpi. Its natural texture breathes with you, offering effortless grace for sunlit mornings or candlelit evenings. A quiet symbol of timeless Indian elegance.",
    category: "Khadi Kurta",
    fabricType: "Pure Handwoven Khadi",
    color: "Ivory White",
    pattern: "Minimalist Plain",
    size: "L",
    price: 1599,
    discountPrice: 1299,
    stock: 68,
    images: [
      { url: "https://khaddarvas.com/cdn/shop/files/khadisadan.myshopify.com_04e34a5a-f009-4aab-a6b2-9091f61734e4.webp?v=1767978404&width=1200" },
      { url: "https://khaddarvas.com/cdn/shop/files/khadisadan.myshopify.com_22a64377-b109-4cd7-9dcb-df22c16cc4ca.webp?v=1767978442&width=1200" },
      { url: "https://khaddarvas.com/cdn/shop/files/khadisadan.myshopify.com_0ad9d9fb-d7bc-4df0-9851-68112c8db7ed.webp?v=1767978454&width=1200" }
    ],
    materialOrigin: "Kalpi, Uttar Pradesh",
    handwoven: true,
    isFeatured: true,
    tags: ["mens", "kurta", "white", "heritage", "breathable", "minimal"]
  },
  {
    name: "Regal Indigo Nehru Jacket",
    brand: "Kaya Royal",
    description: "Woven under the skilled hands of Varanasi artisans, this deep indigo Nehru jacket carries the soul of ancient royal courts. Its rich texture and commanding presence make it the perfect companion for weddings, soirées, and moments that demand quiet power.",
    category: "Nehru Jacket",
    fabricType: "Heavy Khadi Cotton",
    color: "Deep Indigo",
    pattern: "Subtle Handloom Texture",
    size: "M",
    price: 2499,
    discountPrice: 1999,
    stock: 38,
    images: [
      { url: "https://manyavar.scene7.com/is/image/manyavar/JAC482-302-Cream-404_01-12-2025-08-53:650x900?&dpr=on,2" },
      { url: "https://manyavar.scene7.com/is/image/manyavar/JAC482-302-Cream-405_01-12-2025-14-23:650x900?&dpr=on,2" }
    ],
    materialOrigin: "Varanasi",
    handwoven: true,
    isFeatured: true,
    tags: ["mens", "nehru-jacket", "indigo", "wedding", "regal"]
  },
  {
    name: "Midnight Ebony Khadi Kurta",
    brand: "Kaya Heritage",
    description: "Sleek as a moonless night, this ebony black Khadi kurta blends modern minimalism with centuries-old craftsmanship. Soft, breathable, and effortlessly stylish — wear it alone or layered for an aura of refined mystery.",
    category: "Khadi Kurta",
    fabricType: "Pure Khadi Cotton",
    color: "Midnight Black",
    pattern: "Plain",
    size: "L",
    price: 1499,
    discountPrice: 1199,
    stock: 55,
    images: [
      { url: "https://img.perniaspopupshop.com/catalog/product/j/a/JAOD012340_1.jpg?impolicy=detailimageprod" }
    ],
    materialOrigin: "Kalpi",
    handwoven: true,
    isFeatured: false,
    tags: ["mens", "kurta", "black", "modern", "minimal"]
  },

  // ──────────────────────────────────────────────────────────────
  // WOMEN'S — Graceful & Ethereal
  // ──────────────────────────────────────────────────────────────
  {
    name: "Crimson Whisper Handwoven Saree",
    brand: "Kaya Heritage",
    description: "A poetic drape of crimson that tells stories of love and legacy. Handwoven with delicate zari borders in Kalpi, this saree flows like poetry, turning every step into a celebration of timeless femininity and artisanal mastery.",
    category: "Handwoven Saree",
    fabricType: "Cotton-Silk Khadi Blend",
    color: "Crimson Red",
    pattern: "Intricate Zari Border",
    size: "6.5 Meters",
    price: 4599,
    discountPrice: 3699,
    stock: 15,
    images: [
      { url: "https://hutsandlooms.com/cdn/shop/files/image_6c9f8fda-94de-47e2-8977-d9b685ec8f10.jpg?v=1740475025&width=1000" },
      { url: "https://hutsandlooms.com/cdn/shop/files/image_06cab544-f3d2-43b4-b7f8-d697542c0fc0.jpg?v=1740475045&width=1000" }
    ],
    materialOrigin: "Kalpi",
    handwoven: true,
    isFeatured: true,
    tags: ["womens", "saree", "crimson", "festive", "elegant"]
  },
  {
    name: "Mint Meadow Khadi Kurti",
    brand: "Kaya Everyday",
    description: "Like a fresh breeze through ancient orchards, this mint green khadi kurti brings lightness and joy. Ultra-breathable and feather-soft, it’s made for sun-drenched days, gentle mornings, and effortless everyday grace.",
    category: "Khadi Kurti",
    fabricType: "Pure Khadi Cotton",
    color: "Soft Mint Green",
    pattern: "Solid",
    size: "S",
    price: 1099,
    discountPrice: 899,
    stock: 110,
    images: [
      { url: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT7c9ioEND6im70AYFXWCE69MKC5MCJ3ru9FZOqiN6uQ0mBFsFPWXHvGN1PEbrMFWo9_hllHYqXUUlozZj8Fiyd223c-ej51PyCRQQhn5Nc" },
      { url: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRJU2hH3Br-ZzwQ2pZ0EcF4njdIz2d90qCM1bQ_JZDn83SkY3GK_IfduDWSveh5wVEqJ4Pn5ynJ98npiwXB27VvkNXxmj_C3I-K6IOZ7kCk" }
    ],
    materialOrigin: "Kalpi",
    handwoven: true,
    isFeatured: false,
    tags: ["womens", "kurti", "mint", "summer", "everyday"]
  },
  {
    name: "Golden Hour Anarkali",
    brand: "Kaya Festive",
    description: "Bathed in the warm glow of sunset, this sunshine-yellow anarkali flows with delicate gota patti work. A celebration in fabric — perfect for Holi mornings, garden parties, and every moment you want to shine softly.",
    category: "Anarkali Kurti",
    fabricType: "Handwoven Khadi Cotton",
    color: "Sunshine Yellow",
    pattern: "Gota Patti",
    size: "M",
    price: 1699,
    discountPrice: 1399,
    stock: 48,
    images: [
      { url: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRENqy3kMzbmiim6FwWtgdrFsRuHtVLIjVg7TUN_3PVZYYS4aibIv4hpggyRGXtvXZhON32FrD7DeQtzftozsyrqm1vagmWWQ" }
    ],
    materialOrigin: "Kalpi",
    handwoven: true,
    isFeatured: true,
    tags: ["womens", "anarkali", "yellow", "festive", "gota"]
  },

  // ──────────────────────────────────────────────────────────────
  // UNISEX, KIDS & ACCESSORIES — Soulful & Everyday Luxury
  // ──────────────────────────────────────────────────────────────
  {
    name: "Dusk Charcoal Khadi Stole",
    brand: "Kaya Basics",
    description: "A whisper of warmth and elegance in soft charcoal grey. This organic Khadi stole drapes like a gentle embrace — perfect over kurtas, blazers, or bare shoulders under the stars.",
    category: "Stoles",
    fabricType: "Organic Khadi Cotton",
    color: "Charcoal Grey",
    pattern: "Textured Plain",
    size: "2.2 Meters",
    price: 649,
    stock: 92,
    images: [
      { url: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSDcdLfvnzIWPiWRjvnN4b4yJnZePbygc3i0N6gLpJU_ypflyhJLY2aMMj7XRSkEIMgacdzprQby-Wo4-g-lRel2wMPna2gcaNgnL0oTocfjgAKmUozprZFgg" }
    ],
    materialOrigin: "Kalpi",
    handwoven: true,
    isFeatured: false,
    tags: ["unisex", "stole", "scarf", "winter", "minimal"]
  },
  {
    name: "Heritage Red Gamcha",
    brand: "Kaya Roots",
    description: "The soul of rural India — this traditional handwoven gamcha is soft, absorbent, and endlessly versatile. A timeless companion for yoga, travel, beaches, or simply as a scarf that carries centuries of craft.",
    category: "Gamcha",
    fabricType: "Handwoven Cotton",
    color: "Red & White Check",
    pattern: "Classic Check",
    size: "1.8 x 1 Meter",
    price: 349,
    stock: 280,
    images: [
      { url: "https://www.jhalakenterprises.com/wp-content/uploads/2025/05/Asami-gamcha-red-border-front-and-back-view.jpg" }
    ],
    materialOrigin: "Kalpi",
    handwoven: true,
    isFeatured: false,
    tags: ["unisex", "gamcha", "traditional", "summer"]
  },
  {
    name: "Ivory Dream Wedding Kurta Set",
    brand: "Kaya Exclusive",
    description: "Crafted for the most cherished chapters of life, this ivory silk-khadi kurta set glows with delicate self-embroidery. Soft as a dream, regal as heritage — for grooms who want to shine with quiet grace.",
    category: "Wedding Collection",
    fabricType: "Silk Blend Khadi",
    color: "Ivory",
    pattern: "Self-Embroidered",
    size: "XL",
    price: 5799,
    discountPrice: 4699,
    stock: 22,
    images: [
      { url: "https://archerslounge.com/cdn/shop/products/MAG00887_ef761ea6-b9bb-4fde-a39f-d6aba6be814e.jpg?v=1669094037&width=1000" }
    ],
    materialOrigin: "Varanasi",
    handwoven: true,
    isFeatured: true,
    tags: ["mens", "wedding", "kurta-set", "ivory", "luxury"]
  },
  {
    name: "Indigo Moonlight Potli Bag",
    brand: "Kaya Accessories",
    description: "Hand-dyed in deep indigo and adorned with subtle block prints, this potli bag is a treasure for your most special evenings. Carry stories of craft and color wherever you go.",
    category: "Potli Bags",
    fabricType: "Hand-Dyed Cotton Canvas",
    color: "Deep Indigo",
    pattern: "Block Print",
    size: "Free Size",
    price: 499,
    stock: 62,
    images: [
      { url: "https://5.imimg.com/data5/SELLER/Default/2024/9/454728006/LK/UY/LB/22989175/moonlit-potli-bag-2800-500x500.jpg" }
    ],
    materialOrigin: "Kalpi",
    handwoven: false,
    isFeatured: false,
    tags: ["accessories", "potli", "bag", "indigo", "festive"]
  },

  // ──────────────────────────────────────────────────────────────
  // RAW FABRICS — For the Creators
  // ──────────────────────────────────────────────────────────────
  {
    name: "Eternal Khadi Fabric Roll",
    brand: "Kaya Looms",
    description: "The original fabric of freedom — pure, handspun, handwoven Khadi. Every meter carries the rhythm of the loom and the breath of the weaver. Perfect for your most cherished creations.",
    category: "Raw Khadi Fabric",
    fabricType: "100% Pure Khadi",
    color: "Natural Off-White",
    pattern: "Organic Texture",
    size: "Per Meter",
    price: 379,
    stock: 920,
    images: [
      { url: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT6Nu7e6QSH_iJueOL2FOCWz58EAmUwmVFzFtFj31jSN5Dtjtd79mUCefLe9UssTL9viKUSgY47KuguGpyVrpD4QiBB88c3qaTN7OFRpm38_eJiUcgAssiTJJ8" }
    ],
    materialOrigin: "Kalpi",
    handwoven: true,
    isFeatured: true,
    tags: ["fabric", "khadi", "raw", "heritage"]
  },
  {
    name: "Golden Veil Chanderi Fabric",
    brand: "Kaya Looms",
    description: "A shimmering whisper of gold that has adorned queens for centuries. Lightweight, luminous Chanderi silk-cotton — the perfect canvas for festive dreams and heirloom garments.",
    category: "Chanderi Fabric",
    fabricType: "Chanderi Silk Cotton",
    color: "Golden Beige",
    pattern: "Subtle Sheen",
    size: "Per Meter",
    price: 849,
    stock: 195,
    images: [
      { url: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTOoK5bLPncMUblaBaK3x_rjMhZEiA96WPKfeXNUedV0DxcvDu-3wwN9uK3l_JhByt6EJ0OIYQVXlXZney-JWrj9UtgK70jtfWIraurlk6oxl5JxM9v-A-rhA" }
    ],
    materialOrigin: "Chanderi, Madhya Pradesh",
    handwoven: true,
    isFeatured: true,
    tags: ["fabric", "chanderi", "golden", "luxury"]
  }
  // (You can easily add 8–10 more using the same beautiful style)
];

const seedDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("Connected to MongoDB");

    await Product.deleteMany({});
    console.log(" Cleared existing products");

    await Product.insertMany(seedProducts);
    console.log(" Successfully seeded 20 aesthetic, luxury Kaya products!");

    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(" Error seeding database:", err);
    process.exit(1);
  }
};

seedDB();