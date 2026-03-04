require('dotenv').config();

const { sequelize, Product } = require('../models');

const products = [
  {
    id: 1,
    name: 'Apple iPhone 15 Pro Max (256GB) - Natural Titanium',
    description: 'Flagship Apple smartphone with A17 Pro chip and premium build.',
    price: 159900,
    image_url: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500&auto=format&fit=crop&q=60',
    category: 'Mobiles',
    rating: 4.8,
    reviews: 1250
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra 5G (256GB) - Titanium Gray',
    description: 'High-end Samsung Android phone with S-Pen and excellent camera.',
    price: 129999,
    image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop&q=60',
    category: 'Mobiles',
    rating: 4.7,
    reviews: 980
  },
  {
    id: 3,
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    description: 'Premium wireless headphones with active noise cancellation.',
    price: 29990,
    image_url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&auto=format&fit=crop&q=60',
    category: 'Electronics',
    rating: 4.6,
    reviews: 2150
  },
  {
    id: 4,
    name: 'MacBook Air 15-inch (M3 Chip, 8GB RAM, 256GB SSD)',
    description: 'Lightweight Apple laptop with M3 performance and all-day battery.',
    price: 134900,
    image_url: 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=500&auto=format&fit=crop&q=60',
    category: 'Laptops',
    rating: 4.9,
    reviews: 890
  },
  {
    id: 5,
    name: "Nike Air Force 1 '07 Men's Sneakers - White",
    description: 'Classic everyday sneaker with iconic silhouette.',
    price: 7495,
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60',
    category: 'Footwear',
    rating: 4.5,
    reviews: 3200
  },
  {
    id: 6,
    name: 'Adidas Ultraboost Light Running Shoes - Black',
    description: 'Comfort-first running shoes with responsive cushioning.',
    price: 16999,
    image_url: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=500&auto=format&fit=crop&q=60',
    category: 'Footwear',
    rating: 4.4,
    reviews: 1560
  },
  {
    id: 7,
    name: 'Samsung 55-inch Crystal 4K UHD Smart TV',
    description: 'Smart TV with vivid 4K panel and streaming apps.',
    price: 45990,
    image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop&q=60',
    category: 'TV',
    rating: 4.3,
    reviews: 780
  },
  {
    id: 8,
    name: 'Apple Watch Series 9 GPS 45mm - Midnight Aluminum',
    description: 'Advanced smartwatch with health and fitness tracking.',
    price: 41900,
    image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60',
    category: 'Wearables',
    rating: 4.7,
    reviews: 1450
  },
  {
    id: 9,
    name: 'Canon EOS R50 Mirrorless Camera with 18-45mm Lens',
    description: 'Creator-friendly mirrorless camera with 4K capability.',
    price: 58995,
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60',
    category: 'Cameras',
    rating: 4.6,
    reviews: 420
  },
  {
    id: 10,
    name: 'PlayStation 5 Console (Disc Edition) with DualSense Controller',
    description: 'Next-gen gaming console with ultra-fast load times.',
    price: 49990,
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=60',
    category: 'Gaming',
    rating: 4.9,
    reviews: 5600
  },
  {
    id: 11,
    name: 'Logitech MX Master 3S Wireless Performance Mouse',
    description: 'Ergonomic productivity mouse with precision tracking.',
    price: 8995,
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60',
    category: 'Accessories',
    rating: 4.8,
    reviews: 2100
  },
  {
    id: 12,
    name: 'Keychron K2 Wireless Mechanical Keyboard (Hot-Swappable)',
    description: 'Compact wireless mechanical keyboard for typing and coding.',
    price: 8499,
    image_url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=60',
    category: 'Accessories',
    rating: 4.5,
    reviews: 890
  }
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    for (const product of products) {
      const existing = await Product.findByPk(product.id);
      if (existing) {
        await existing.update(product);
      } else {
        await Product.create(product);
      }
    }

    console.log('Products seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Product seed failed:', error.message);
    process.exit(1);
  }
};

seed();