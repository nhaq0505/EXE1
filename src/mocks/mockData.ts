export interface Farm {
  id: string;
  name: string;
  image: string;
  description: string;
  location: string;
  rating: number;
  videoUrl?: string;
}

export interface Product {
  id: string;
  farmId: string;
  name: string;
  image: string;
  price: number;
  category: string;
  unit: string;
}

export const farms: Farm[] = [
  {
    id: "f1",
    name: "Green Valley Farm",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop",
    description: "A beautiful organic farm dedicated to sustainable agriculture.",
    location: "Da Lat, Lam Dong",
    rating: 4.8,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: "f2",
    name: "Sunny Meadows",
    image: "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=2069&auto=format&fit=crop",
    description: "Specializing in fresh, seasonal fruits and vegetables directly to your table.",
    location: "Moc Chau, Son La",
    rating: 4.5,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: "f3",
    name: "Riverstone Organics",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2003&auto=format&fit=crop",
    description: "Premium quality organic meats and dairy products from free-range animals.",
    location: "Ba Vi, Hanoi",
    rating: 4.9,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: "f4",
    name: "Highland Tea Estate",
    image: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?q=80&w=2000&auto=format&fit=crop",
    description: "Organic tea plantation offering the finest hand-picked tea leaves.",
    location: "Bao Loc, Lam Dong",
    rating: 4.7,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: "f5",
    name: "Oceanic AquaFarm",
    image: "https://images.unsplash.com/photo-1518814436548-56ca8121f614?q=80&w=2000&auto=format&fit=crop",
    description: "Sustainable aquaculture providing fresh, ocean-caught quality seafood.",
    location: "Nha Trang, Khanh Hoa",
    rating: 4.6,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
  }
];

export const products: Product[] = [
  {
    id: "p1",
    farmId: "f1",
    name: "Organic Tomatoes",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2032&auto=format&fit=crop",
    price: 35000,
    category: "Vegetables",
    unit: "kg"
  },
  {
    id: "p2",
    farmId: "f1",
    name: "Fresh Lettuce",
    image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?q=80&w=2069&auto=format&fit=crop",
    price: 20000,
    category: "Vegetables",
    unit: "bundle"
  },
  {
    id: "p3",
    farmId: "f2",
    name: "Sweet Strawberries",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=2070&auto=format&fit=crop",
    price: 150000,
    category: "Fruits",
    unit: "kg"
  },
  {
    id: "p4",
    farmId: "f2",
    name: "Juicy Oranges",
    image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=2000",
    price: 45000,
    category: "Fruits",
    unit: "kg"
  },
  {
    id: "p5",
    farmId: "f3",
    name: "Free-range Chicken",
    image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2076&auto=format&fit=crop",
    price: 120000,
    category: "Meat",
    unit: "kg"
  },
  {
    id: "p6",
    farmId: "f3",
    name: "Organic Beef",
    image: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
    price: 250000,
    category: "Meat",
    unit: "kg"
  },
  {
    id: "p7",
    farmId: "f4",
    name: "Oolong Tea Leaves",
    image: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?q=80&w=2000&auto=format&fit=crop",
    price: 85000,
    category: "Khác",
    unit: "hộp"
  },
  {
    id: "p8",
    farmId: "f4",
    name: "Matcha Green Tea Powder",
    image: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=2000&auto=format&fit=crop",
    price: 120000,
    category: "Khác",
    unit: "hộp"
  },
  {
    id: "p9",
    farmId: "f5",
    name: "Fresh Atlantic Salmon",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2000&auto=format&fit=crop",
    price: 350000,
    category: "Thịt",
    unit: "kg"
  },
  {
    id: "p10",
    farmId: "f5",
    name: "Tiger Prawns",
    image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=2000&auto=format&fit=crop",
    price: 450000,
    category: "Thịt",
    unit: "kg"
  },
  {
    id: "p11",
    farmId: "f1",
    name: "Organic Carrots",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=2000&auto=format&fit=crop",
    price: 25000,
    category: "Vegetables",
    unit: "kg"
  },
  {
    id: "p12",
    farmId: "f2",
    name: "Watermelon",
    image: "https://images.unsplash.com/photo-1587049352847-4d4b1245eebe?q=80&w=2000&auto=format&fit=crop",
    price: 15000,
    category: "Fruits",
    unit: "kg"
  }
];
