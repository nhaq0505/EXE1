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
    videoUrl: "https://videos.pexels.com/video-files/3266800/3266800-uhd_2560_1440_30fps.mp4"
  },
  {
    id: "f2",
    name: "Sunny Meadows",
    image: "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=2069&auto=format&fit=crop",
    description: "Specializing in fresh, seasonal fruits and vegetables directly to your table.",
    location: "Moc Chau, Son La",
    rating: 4.5,
    videoUrl: "https://videos.pexels.com/video-files/3266800/3266800-uhd_2560_1440_30fps.mp4"
  },
  {
    id: "f3",
    name: "Riverstone Organics",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2003&auto=format&fit=crop",
    description: "Premium quality organic meats and dairy products from free-range animals.",
    location: "Ba Vi, Hanoi",
    rating: 4.9,
    videoUrl: "https://videos.pexels.com/video-files/3266800/3266800-uhd_2560_1440_30fps.mp4"
  },
  {
    id: "f4",
    name: "Highland Tea Estate",
    image: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?q=80&w=2000&auto=format&fit=crop",
    description: "Organic tea plantation offering the finest hand-picked tea leaves.",
    location: "Bao Loc, Lam Dong",
    rating: 4.7,
    videoUrl: "https://videos.pexels.com/video-files/3266800/3266800-uhd_2560_1440_30fps.mp4"
  },
  {
    id: "f5",
    name: "Oceanic AquaFarm",
    image: "https://i.pinimg.com/736x/d5/c9/d5/d5c9d5abd14f8e8c50e4e9eb982c159b.jpg",
    description: "Sustainable aquaculture providing fresh, ocean-caught quality seafood.",
    location: "Nha Trang, Khanh Hoa",
    rating: 4.6,
    videoUrl: "https://videos.pexels.com/video-files/3266800/3266800-uhd_2560_1440_30fps.mp4"
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
    image: "https://i.pinimg.com/736x/28/b2/3e/28b23e46d1ede2b64e084230bb77876e.jpg",
    price: 15000,
    category: "Fruits",
    unit: "kg"
  }
];

export interface MealPlan {
  id: string;
  title: string;
  targetAudience: string;
  calories: number;
  dishes: string[];
  features: string[];
  totalPrice: number;
}

export const mealPlans: MealPlan[] = [
  {
    id: "mp1",
    title: "Thực Đơn Đôi Lứa",
    targetAudience: "Gia đình 2 người",
    calories: 1200,
    dishes: [
      "Canh bí đỏ hầm xương",
      "Cá hồi áp chảo sốt chanh leo",
      "Rau cải xào tỏi",
      "Cơm gạo lứt hữu cơ",
      "Salad dưa leo cà chua cherry"
    ],
    features: ["Zero Waste", "Tối ưu Dinh dưỡng", "Nấu nhanh 30 phút"],
    totalPrice: 285000
  },
  {
    id: "mp2",
    title: "Thực Đơn Gia Đình Nhỏ",
    targetAudience: "Gia đình 3 người",
    calories: 1800,
    dishes: [
      "Canh chua cá lóc đồng",
      "Thịt bò xào rau cải",
      "Đậu phụ sốt cà chua",
      "Gà hấp gừng hành",
      "Cơm trắng & Rau luộc",
      "Canh rau ngót thịt băm"
    ],
    features: ["Zero Waste", "Tối ưu Logistics", "Thân thiện trẻ em"],
    totalPrice: 420000
  },
  {
    id: "mp3",
    title: "Thực Đơn Gia Đình Chuẩn",
    targetAudience: "Gia đình 4 người",
    calories: 2400,
    dishes: [
      "Thịt kho tàu hột vịt",
      "Canh khổ qua nhồi thịt",
      "Tôm sú rang muối",
      "Rau muống xào tỏi",
      "Cơm gạo lứt & Dưa leo",
      "Chả giò rau củ",
      "Súp bí đỏ kem"
    ],
    features: ["Zero Waste", "Tối ưu Logistics", "Cân bằng dinh dưỡng", "Gom đơn chung cư"],
    totalPrice: 580000
  },
  {
    id: "mp4",
    title: "Thực Đơn Đại Gia Đình",
    targetAudience: "Gia đình 5 người",
    calories: 2800,
    dishes: [
      "Lẩu thái hải sản",
      "Sườn non kho sả ớt",
      "Bông cải xanh xào nấm",
      "Tôm chiên giòn mắm tỏi",
      "Canh bò rau thập cẩm",
      "Cơm trắng & Dưa cải muối",
      "Chè đậu xanh hạt sen",
      "Trái cây tráng miệng theo mùa"
    ],
    features: ["Zero Waste", "Tối ưu Logistics", "Phong phú 8 món", "Gom đơn chung cư", "Cao cấp"],
    totalPrice: 730000
  }
];
