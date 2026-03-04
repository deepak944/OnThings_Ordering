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
    image: "https://th.bing.com/th/id/OIP.-VvS-aeqS4iOvphwIXglzgHaE8?w=238&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
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
