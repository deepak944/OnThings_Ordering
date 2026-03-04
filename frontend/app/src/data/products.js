export const products = [
  {
    id: 1,
    title: "Apple iPhone 15 Pro Max (256GB) - Natural Titanium",
    price: 159900,
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500&auto=format&fit=crop&q=60",
    category: "Mobiles",
    rating: 4.8,
    reviews: 1250
  },
  {
    id: 2,
    title: "Samsung Galaxy S24 Ultra 5G (256GB) - Titanium Gray",
    price: 129999,
    image: "https://th.bing.com/th/id/OIP.Gs4cROu0g0caPhkyy2ETYwHaEK?w=301&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
    category: "Mobiles",
    rating: 4.7,
    reviews: 980
  },
  {
    id: 3,
    title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    price: 29990,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&auto=format&fit=crop&q=60",
    category: "Electronics",
    rating: 4.6,
    reviews: 2150
  },
  {
    id: 4,
    title: "MacBook Air 15-inch (M3 Chip, 8GB RAM, 256GB SSD)",
    price: 134900,
    image: "data:image/webp;base64,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",
    category: "Laptops",
    rating: 4.9,
    reviews: 890
  },
  {
    id: 5,
    title: "Nike Air Force 1 '07 Men's Sneakers - White",
    price: 7495,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60",
    category: "Footwear",
    rating: 4.5,
    reviews: 3200
  },
  {
    id: 6,
    title: "Adidas Ultraboost Light Running Shoes - Black",
    price: 16999,
    image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=500&auto=format&fit=crop&q=60",
    category: "Footwear",
    rating: 4.4,
    reviews: 1560
  },
  {
    id: 7,
    title: "Samsung 55-inch Crystal 4K UHD Smart TV",
    price: 45990,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop&q=60",
    category: "TV",
    rating: 4.3,
    reviews: 780
  },
  {
    id: 8,
    title: "Apple Watch Series 9 GPS 45mm - Midnight Aluminum",
    price: 41900,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60",
    category: "Wearables",
    rating: 4.7,
    reviews: 1450
  },
  {
    id: 9,
    title: "Canon EOS R50 Mirrorless Camera with 18-45mm Lens",
    price: 58995,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60",
    category: "Cameras",
    rating: 4.6,
    reviews: 420
  },
  {
    id: 10,
    title: "PlayStation 5 Console (Disc Edition) with DualSense Controller",
    price: 49990,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=60",
    category: "Gaming",
    rating: 4.9,
    reviews: 5600
  },
  {
    id: 11,
    title: "Logitech MX Master 3S Wireless Performance Mouse",
    price: 8995,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60",
    category: "Accessories",
    rating: 4.8,
    reviews: 2100
  },
  {
    id: 12,
    title: "Keychron K2 Wireless Mechanical Keyboard (Hot-Swappable)",
    price: 8499,
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=60",
    category: "Accessories",
    rating: 4.5,
    reviews: 890
  }
];

export const getProductById = (id) => {
  return products.find(product => product.id === parseInt(id));
};

export const searchProducts = (query) => {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return products;
  
  return products.filter(product => 
    product.title.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm)
  );
};
