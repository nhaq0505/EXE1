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
    name: "Trang Trại Rừng Xanh",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop",
    description: "Trang trại hữu cơ xanh mút, cam kết canh tác bền vững và an toàn cho sức khỏe.",
    location: "Dà Lạt, Lâm Đồng",
    rating: 4.8,
    videoUrl: "https://videos.pexels.com/video-files/3266800/3266800-uhd_2560_1440_30fps.mp4"
  },
  {
    id: "f2",
    name: "Vườn Cao Nguyên",
    image: "https://i.pinimg.com/736x/ec/b4/19/ecb419060c1fc1e19265566c8bc536cd.jpg",
    description: "Chuyên cung cấp rựa quả, trái cây tươi theo mùa, thẳng từ vườn đến bàn ăn của bạn.",
    location: "Mộc Châu, Sơn La",
    rating: 4.5,
    videoUrl: "https://videos.pexels.com/video-files/3266800/3266800-uhd_2560_1440_30fps.mp4"
  },
  {
    id: "f3",
    name: "Nông Trại Phú Nguyên",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2003&auto=format&fit=crop",
    description: "Thịt sạch và thực phẩm hữu cơ cao cấp từ vật nuôi thả tự nhiên, chăn thả ngoài trời.",
    location: "Ba Vì, Hà Nội",
    rating: 4.9,
    videoUrl: "https://videos.pexels.com/video-files/3266800/3266800-uhd_2560_1440_30fps.mp4"
  },
  {
    id: "f4",
    name: "Đồi Chè Bảo Lộc",
    image: "https://i.pinimg.com/1200x/58/4f/5a/584f5a2b707377663a5c50c6966eecb8.jpg",
    description: "Trang trại trồng chè hữu cơ các loại, hái thủ công, chế biến truyền thống.",
    location: "Bảo Lộc, Lâm Đồng",
    rating: 4.7,
    videoUrl: "https://videos.pexels.com/video-files/3266800/3266800-uhd_2560_1440_30fps.mp4"
  },
  {
    id: "f5",
    name: "Trại Thuỷ Sản Biển Xanh",
    image: "https://i.pinimg.com/1200x/98/aa/54/98aa549386e82e4c061992d91540d526.jpg",
    description: "Nuôi trồng thủy sản bền vững, cung cấp hải sản tươi ngon chất lượng cao.",
    location: "Nha Trang, Khánh Hòa",
    rating: 4.6,
    videoUrl: "https://videos.pexels.com/video-files/3266800/3266800-uhd_2560_1440_30fps.mp4"
  }
];

export const products: Product[] = [
  {
    id: "p1",
    farmId: "f1",
    name: "Cà Chua Hữu Cơ",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2032&auto=format&fit=crop",
    price: 35000,
    category: "Rau Củ",
    unit: "kg"
  },
  {
    id: "p2",
    farmId: "f1",
    name: "Xà Lách Tươi",
    image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?q=80&w=2069&auto=format&fit=crop",
    price: 20000,
    category: "Rau Củ",
    unit: "bó"
  },
  {
    id: "p3",
    farmId: "f2",
    name: "Dâu Tây Ngọt",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=2070&auto=format&fit=crop",
    price: 150000,
    category: "Trái Cây",
    unit: "kg"
  },
  {
    id: "p4",
    farmId: "f2",
    name: "Cam Sành Mọi",
    image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=2000",
    price: 45000,
    category: "Trái Cây",
    unit: "kg"
  },
  {
    id: "p5",
    farmId: "f3",
    name: "Gà Thả Vườn",
    image: "https://i.pinimg.com/1200x/dc/f9/b6/dcf9b63c48be495bda471fcf364ce9cc.jpg",
    price: 120000,
    category: "Thịt",
    unit: "kg"
  },
  {
    id: "p6",
    farmId: "f3",
    name: "Thịt Bò Hữu Cơ",
    image: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
    price: 250000,
    category: "Thịt",
    unit: "kg"
  },
  {
    id: "p7",
    farmId: "f4",
    name: "Trà Ô Long Thượng Hạng",
    image: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?q=80&w=2000&auto=format&fit=crop",
    price: 85000,
    category: "Khác",
    unit: "hộp"
  },
  {
    id: "p8",
    farmId: "f4",
    name: "Bột Matcha Tươi",
    image: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=2000&auto=format&fit=crop",
    price: 120000,
    category: "Khác",
    unit: "hộp"
  },
  {
    id: "p9",
    farmId: "f5",
    name: "Cá Hồi Tươi",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2000&auto=format&fit=crop",
    price: 350000,
    category: "Hải Sản",
    unit: "kg"
  },
  {
    id: "p10",
    farmId: "f5",
    name: "Tôm Sú Khổng Lồ",
    image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=2000&auto=format&fit=crop",
    price: 450000,
    category: "Hải Sản",
    unit: "kg"
  },
  {
    id: "p11",
    farmId: "f1",
    name: "Cà Rốt Hữu Cơ",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=2000&auto=format&fit=crop",
    price: 25000,
    category: "Rau Củ",
    unit: "kg"
  },
  {
    id: "p12",
    farmId: "f2",
    name: "Dưa Hấu Hữu Cơ",
    image: "https://i.pinimg.com/736x/28/b2/3e/28b23e46d1ede2b64e084230bb77876e.jpg",
    price: 15000,
    category: "Trái Cây",
    unit: "kg"
  },
  // === Nguyên liệu thực đơn thông minh ===
  {
    id: "p13",
    farmId: "f1",
    name: "Bí Đỏ Hữu Cơ",
    image: "https://i.pinimg.com/1200x/88/f6/81/88f681849b0745411fceacc4d99afcff.jpg",
    price: 18000,
    category: "Rau Củ",
    unit: "kg"
  },
  {
    id: "p14",
    farmId: "f2",
    name: "Dưa Leo Tươi",
    image: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?q=80&w=2000&auto=format&fit=crop",
    price: 12000,
    category: "Rau Củ",
    unit: "kg"
  },
  {
    id: "p15",
    farmId: "f1",
    name: "Gạo Lứt",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=2000&auto=format&fit=crop",
    price: 32000,
    category: "Khác",
    unit: "kg"
  },
  {
    id: "p16",
    farmId: "f5",
    name: "Cá Lóc Đồng Tươi",
    image: "https://tepbac.com/upload/news/ge_image/2022/05/ca-loc-1_1652239081.jpg",
    price: 95000,
    category: "Hải Sản",
    unit: "kg"
  },
  {
    id: "p17",
    farmId: "f1",
    name: "Đậu Phụ Non",
    image: "https://i.pinimg.com/736x/19/dd/07/19dd078faef91d90cad85ffcf6aba6bb.jpg",
    price: 15000,
    category: "Khác",
    unit: "bịch"
  },
  {
    id: "p18",
    farmId: "f2",
    name: "Rau Muống Sạch",
    image: "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?q=80&w=2000&auto=format&fit=crop",
    price: 10000,
    category: "Rau Củ",
    unit: "bó"
  },
  {
    id: "p19",
    farmId: "f2",
    name: "Khổ Qua (Mướp Đắng)",
    image: "https://i.pinimg.com/736x/63/60/12/63601251b622150db9548d8523bbfb5c.jpg",
    price: 14000,
    category: "Rau Củ",
    unit: "kg"
  },
  {
    id: "p20",
    farmId: "f1",
    name: "Bông Cải Xanh & Nấm",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=2000&auto=format&fit=crop",
    price: 35000,
    category: "Rau Củ",
    unit: "kg"
  },
  {
    id: "p21",
    farmId: "f3",
    name: "Sườn Non Heo Sạch",
    image: "https://i.pinimg.com/736x/5f/cf/4b/5fcf4bc0f50eedc184cc0d5122155304.jpg",
    price: 180000,
    category: "Thịt",
    unit: "kg"
  },
  {
    id: "p22",
    farmId: "f2",
    name: "Đậu Xanh Hạt Sen",
    image: "https://i.pinimg.com/1200x/d8/99/b8/d899b8cd0803793bd47ee222458818f9.jpg",
    price: 28000,
    category: "Khác",
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

/**
 * Maps each MealPlan ID → array of Product IDs that form its ingredient basket.
 * All IDs are sourced from the existing `products` array above.
 */
export const menuIngredients: Record<string, string[]> = {
  // Thực đơn Đôi Lứa (2 người)
  // Cá hồi áp chào + Canh bí đỏ + Rau cải + Gạo lứt + Salad dưa leo
  mp1: ["p9", "p13", "p14", "p15", "p2", "p1"],

  // Gia Đình Nhỏ (3 người)
  // Cá lóc + Thịt bò xào + Đậu phụ + Gà hấp + Rau ngót
  mp2: ["p16", "p6", "p17", "p5", "p2", "p1", "p11"],

  // Gia Đình Chuẩn (4 người)
  // Tôm sú + Thịt kho + Khổ qua + Rau muống + Gạo lứt + Dưa leo + Bí đỏ (súp) + Cà rốt
  mp3: ["p10", "p6", "p19", "p18", "p15", "p14", "p1", "p11", "p13"],

  // Đại Gia Đình (5 người)
  // Hải sản lẩu + Sườn non + Bông cải xanh + Tôm + Bò + Đậu xanh + Trái cây
  mp4: ["p9", "p10", "p21", "p20", "p6", "p1", "p2", "p22", "p12"],
};

