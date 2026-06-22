using GreenSolution.Core.Entities;
using GreenSolution.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace GreenSolution.Infrastructure.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            // Clean up old seed if it exists to transition to the new schema and IDs
            var oldFarm = await context.Farms.FindAsync("f1");
            if (oldFarm != null)
            {
                context.Farms.Remove(oldFarm);
                await context.SaveChangesAsync();
            }

            // Ensure existing farms and products are active and optimize video URLs
            await context.Database.ExecuteSqlRawAsync("UPDATE Farms SET IsActive = 1;");
            await context.Database.ExecuteSqlRawAsync("UPDATE Products SET IsActive = 1;");
            await context.Database.ExecuteSqlRawAsync("UPDATE Farms SET VideoUrl = 'https://videos.pexels.com/video-files/3266800/3266800-sd_640_360_30fps.mp4' WHERE VideoUrl LIKE '%3266800-uhd%';");

            // Seed Owner User
            var ownerId = "owner-danang-id-123456";
            var existingOwner = await context.Users.FirstOrDefaultAsync(u => u.Email == "owner@greensolution.vn");
            if (existingOwner == null)
            {
                var ownerUser = new User
                {
                    Id = ownerId,
                    Email = "owner@greensolution.vn",
                    FullName = "Chủ Vườn Đà Nẵng",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    Role = UserRole.FarmOwner,
                    Phone = "0999888777",
                    Address = "Hòa Vang, Đà Nẵng",
                    CreatedAt = DateTime.UtcNow
                };
                await context.Users.AddAsync(ownerUser);
                await context.SaveChangesAsync();
            }
            else
            {
                ownerId = existingOwner.Id;
            }

            // Seed Admin User
            if (!await context.Users.AnyAsync(u => u.Email == "admin@greensolution.vn"))
            {
                var adminUser = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Email = "admin@greensolution.vn",
                    FullName = "Default Admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = UserRole.Admin,
                    CreatedAt = DateTime.UtcNow
                };
                await context.Users.AddAsync(adminUser);
                await context.SaveChangesAsync();
            }

            // Seed Farms
            var farms = new List<Farm>
            {
                new Farm
                {
                    Id = "6d8319bd-62db-1cc1-55ab-251ccaca5645",
                    Name = "Rau Xanh Đà Nẵng",
                    Image = "https://rauxanhdanang.com/wp-content/uploads/2023/04/rauxanhdanang.com-logo-1.png",
                    Description = "Trang trại hữu cơ xanh mút, cam kết canh tác bền vững và an toàn cho sức khỏe.",
                    Location = "Hoà Vang, Đà Nẵng",
                    Rating = 4.8,
                    VideoUrl = "https://videos.pexels.com/video-files/3266800/3266800-sd_640_360_30fps.mp4",
                    OwnerId = ownerId
                },
                new Farm
                {
                    Id = "f2",
                    Name = "Top Việt",
                    Image = "https://topvietmart.com/wp-content/uploads/2023/10/logo.png",
                    Description = "Chuyên cung cấp rựa quả, trái cây tươi theo mùa, thẳng từ vườn đến bàn ăn của bạn.",
                    Location = "Hoà Vang,Đà Nẵng",
                    Rating = 4.5,
                    VideoUrl = "https://videos.pexels.com/video-files/3266800/3266800-sd_640_360_30fps.mp4"
                },
                new Farm
                {
                    Id = "f3",
                    Name = "DaNang Fantasic",
                    Image = "https://danangfantasticity.com/wp-content/uploads/dfc/public/main-logo.png",
                    Description = "Thịt sạch và thực phẩm hữu cơ cao cấp từ vật nuôi thả tự nhiên, chăn thả ngoài trời.",
                    Location = "Đà Nẵng",
                    Rating = 4.9,
                    VideoUrl = "https://videos.pexels.com/video-files/3266800/3266800-sd_640_360_30fps.mp4"
                },
                new Farm
                {
                    Id = "f4",
                    Name = "Đồi Chè Bảo Lộc",
                    Image = "https://i.pinimg.com/1200x/58/4f/5a/584f5a2b707377663a5c50c6966eecb8.jpg",
                    Description = "Trang trại trồng chè hữu cơ các loại, hái thủ công, chế biến truyền thống.",
                    Location = "Bảo Lộc, Lâm Đồng",
                    Rating = 4.7,
                    VideoUrl = "https://videos.pexels.com/video-files/3266800/3266800-sd_640_360_30fps.mp4"
                },
                new Farm
                {
                    Id = "f5",
                    Name = "Danafish-Công ty Cổ Phần Thủy Sản Đà Nẵng",
                    Image = "https://i.pinimg.com/1200x/98/aa/54/98aa549386e82e4c061992d91540d526.jpg",
                    Description = "Nuôi trồng thủy sản bền vững, cung cấp hải sản tươi ngon chất lượng cao.",
                    Location = "Đà Nẵng",
                    Rating = 4.6,
                    VideoUrl = "https://videos.pexels.com/video-files/3266800/3266800-sd_640_360_30fps.mp4"
                }
            };

            foreach (var farm in farms)
            {
                var existingFarm = await context.Farms.FindAsync(farm.Id);
                if (existingFarm == null)
                {
                    await context.Farms.AddAsync(farm);
                }
                else
                {
                    if (farm.Id == "6d8319bd-62db-1cc1-55ab-251ccaca5645")
                    {
                        existingFarm.OwnerId = ownerId;
                        context.Farms.Update(existingFarm);
                    }
                }
            }
            await context.SaveChangesAsync();

            // Seed Products
            var products = new List<Product>
            {
                new Product { Id = "p1", FarmId = "6d8319bd-62db-1cc1-55ab-251ccaca5645", Name = "Cà Chua Hữu Cơ", Image = "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2032&auto=format&fit=crop", Price = 35000, Category = "Rau Củ", Unit = "kg", Stock = 5 },
                new Product { Id = "p2", FarmId = "6d8319bd-62db-1cc1-55ab-251ccaca5645", Name = "Xà Lách Tươi", Image = "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?q=80&w=2069&auto=format&fit=crop", Price = 20000, Category = "Rau Củ", Unit = "bó", Stock = 4 },
                new Product { Id = "p3", FarmId = "f2", Name = "Dâu Tây Ngọt", Image = "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=2070&auto=format&fit=crop", Price = 150000, Category = "Trái Cây", Unit = "kg", Stock = 30 },
                new Product { Id = "p4", FarmId = "f2", Name = "Cam Sành Mọi", Image = "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=2000", Price = 45000, Category = "Trái Cây", Unit = "kg", Stock = 60 },
                new Product { Id = "p5", FarmId = "f3", Name = "Gà Thả Vườn", Image = "https://i.pinimg.com/1200x/dc/f9/b6/dcf9b63c48be495bda471fcf364ce9cc.jpg", Price = 120000, Category = "Thịt", Unit = "kg", Stock = 3 },
                new Product { Id = "p6", FarmId = "f3", Name = "Thịt Bò Hữu Cơ", Image = "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000", Price = 250000, Category = "Thịt", Unit = "kg", Stock = 3 },
                new Product { Id = "p7", FarmId = "f4", Name = "Trà Ô Long Thượng Hạng", Image = "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?q=80&w=2000&auto=format&fit=crop", Price = 85000, Category = "Khác", Unit = "hộp", Stock = 50 },
                new Product { Id = "p8", FarmId = "f4", Name = "Bột Matcha Tươi", Image = "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=2000&auto=format&fit=crop", Price = 120000, Category = "Khác", Unit = "hộp", Stock = 40 },
                new Product { Id = "p9", FarmId = "f5", Name = "Cá Hồi Tươi", Image = "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2000&auto=format&fit=crop", Price = 350000, Category = "Hải Sản", Unit = "kg", Stock = 3 },
                new Product { Id = "p10", FarmId = "f5", Name = "Tôm Sú Khổng Lồ", Image = "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=2000&auto=format&fit=crop", Price = 450000, Category = "Hải Sản", Unit = "kg", Stock = 3 },
                new Product { Id = "p11", FarmId = "6d8319bd-62db-1cc1-55ab-251ccaca5645", Name = "Cà Rốt Hữu Cơ", Image = "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=2000&auto=format&fit=crop", Price = 25000, Category = "Rau Củ", Unit = "kg", Stock = 90 },
                new Product { Id = "p12", FarmId = "f2", Name = "Dưa Hấu Hữu Cơ", Image = "https://i.pinimg.com/736x/28/b2/3e/28b23e46d1ede2b64e084230bb77876e.jpg", Price = 15000, Category = "Trái Cây", Unit = "kg", Stock = 45 },
                
                // Ingredients for smart meal plans
                new Product { Id = "p13", FarmId = "6d8319bd-62db-1cc1-55ab-251ccaca5645", Name = "Bí Đỏ Hữu Cơ", Image = "https://i.pinimg.com/1200x/88/f6/81/88f681849b0745411fceacc4d99afcff.jpg", Price = 18000, Category = "Rau Củ", Unit = "kg", Stock = 70 },
                new Product { Id = "p14", FarmId = "f2", Name = "Dưa Leo Tươi", Image = "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?q=80&w=2000&auto=format&fit=crop", Price = 12000, Category = "Rau Củ", Unit = "kg", Stock = 100 },
                new Product { Id = "p15", FarmId = "6d8319bd-62db-1cc1-55ab-251ccaca5645", Name = "Gạo Lứt", Image = "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=2000&auto=format&fit=crop", Price = 32000, Category = "Khác", Unit = "kg", Stock = 200 },
                new Product { Id = "p16", FarmId = "f5", Name = "Cá Lóc Đồng Tươi", Image = "https://tepbac.com/upload/news/ge_image/2022/05/ca-loc-1_1652239081.jpg", Price = 95000, Category = "Hải Sản", Unit = "kg", Stock = 18 },
                new Product { Id = "p17", FarmId = "6d8319bd-62db-1cc1-55ab-251ccaca5645", Name = "Đậu Phụ Non", Image = "https://i.pinimg.com/736x/19/dd/07/19dd078faef91d90cad85ffcf6aba6bb.jpg", Price = 15000, Category = "Khác", Unit = "bịch", Stock = 60 },
                new Product { Id = "p18", FarmId = "f2", Name = "Rau Muống Sạch", Image = "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?q=80&w=2000&auto=format&fit=crop", Price = 10000, Category = "Rau Củ", Unit = "bó", Stock = 150 },
                new Product { Id = "p19", FarmId = "f2", Name = "Khổ Qua (Mướp Đắng)", Image = "https://i.pinimg.com/736x/63/60/12/63601251b622150db9548d8523bbfb5c.jpg", Price = 14000, Category = "Rau Củ", Unit = "kg", Stock = 55 },
                new Product { Id = "p20", FarmId = "6d8319bd-62db-1cc1-55ab-251ccaca5645", Name = "Bông Cải Xanh & Nấm", Image = "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=2000&auto=format&fit=crop", Price = 35000, Category = "Rau Củ", Unit = "kg", Stock = 35 },
                new Product { Id = "p21", FarmId = "f3", Name = "Sườn Non Heo Sạch", Image = "https://i.pinimg.com/736x/5f/cf/4b/5fcf4bc0f50eedc184cc0d5122155304.jpg", Price = 180000, Category = "Thịt", Unit = "kg", Stock = 4 },
                new Product { Id = "p22", FarmId = "f2", Name = "Đậu Xanh Hạt Sen", Image = "https://i.pinimg.com/1200x/d8/99/b8/d899b8cd0803793bd47ee222458818f9.jpg", Price = 28000, Category = "Khác", Unit = "kg", Stock = 75 },
                
                // New products
                new Product { Id = "p23", FarmId = "f3", Name = "Thịt Heo Sạch", Image = "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=2000&auto=format&fit=crop", Price = 130000, Category = "Thịt", Unit = "kg", Stock = 4 },
                new Product { Id = "p24", FarmId = "f5", Name = "Cá Ngừ Tươi", Image = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2000&auto=format&fit=crop", Price = 280000, Category = "Hải Sản", Unit = "kg", Stock = 2 },
                new Product { Id = "p25", FarmId = "f3", Name = "Trứng Gà Thả Vườn", Image = "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=2000&auto=format&fit=crop", Price = 45000, Category = "Khác", Unit = "vỉ", Stock = 5 },
                new Product { Id = "p26", FarmId = "f3", Name = "Nước Xốt Thịt Nướng", Image = "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?q=80&w=2000&auto=format&fit=crop", Price = 35000, Category = "Khác", Unit = "chai", Stock = 3 },
                new Product { Id = "p27", FarmId = "6d8319bd-62db-1cc1-55ab-251ccaca5645", Name = "Rau Ngò Tươi", Image = "https://images.unsplash.com/photo-1592928302636-c83cf1e1c887?q=80&w=2000&auto=format&fit=crop", Price = 8000, Category = "Rau Củ", Unit = "bó", Stock = 5 }
            };

            foreach (var product in products)
            {
                var existingProduct = await context.Products.FindAsync(product.Id);
                if (existingProduct == null)
                {
                    await context.Products.AddAsync(product);
                }
            }
            await context.SaveChangesAsync();

            // Seed Meal Plans
            var mealPlans = new List<MealPlan>
            {
                new MealPlan
                {
                    Id = "mp1",
                    Title = "Thực Đơn Đôi Lứa",
                    TargetAudience = "Gia đình 2 người",
                    Calories = 1200,
                    Dishes = new List<string>
                    {
                        "Canh bí đỏ hầm xương",
                        "Cá hồi áp chảo sốt chanh leo",
                        "Rau cải xào tỏi",
                        "Cơm gạo lứt hữu cơ",
                        "Salad dưa leo cà chua cherry"
                    },
                    Features = new List<string> { "Zero Waste", "Tối ưu Dinh dưỡng", "Nấu nhanh 30 phút" },
                    TotalPrice = 285000
                },
                new MealPlan
                {
                    Id = "mp2",
                    Title = "Thực Đơn Gia Đình Nhỏ",
                    TargetAudience = "Gia đình 3 người",
                    Calories = 1800,
                    Dishes = new List<string>
                    {
                        "Canh chua cá lóc đồng",
                        "Thịt bò xào rau cải",
                        "Đậu phụ sốt cà chua",
                        "Gà hấp gừng hành",
                        "Cơm trắng & Rau luộc",
                        "Canh rau ngót thịt băm"
                    },
                    Features = new List<string> { "Zero Waste", "Tối ưu Logistics", "Thân thiện trẻ em" },
                    TotalPrice = 420000
                },
                new MealPlan
                {
                    Id = "mp3",
                    Title = "Thực Đơn Gia Đình Chuẩn",
                    TargetAudience = "Gia đình 4 người",
                    Calories = 2400,
                    Dishes = new List<string>
                    {
                        "Thịt kho tàu hột vịt",
                        "Canh khổ qua nhồi thịt",
                        "Tôm sú rang muối",
                        "Rau muống xào tỏi",
                        "Cơm gạo lứt & Dưa leo",
                        "Chả giò rau củ",
                        "Súp bí đỏ kem"
                    },
                    Features = new List<string> { "Zero Waste", "Tối ưu Logistics", "Cân bằng dinh dưỡng", "Gom đơn chung cư" },
                    TotalPrice = 580000
                },
                new MealPlan
                {
                    Id = "mp4",
                    Title = "Thực Đơn Đại Gia Đình",
                    TargetAudience = "Gia đình 5 người",
                    Calories = 2800,
                    Dishes = new List<string>
                    {
                        "Lẩu thái hải sản",
                        "Sườn non kho sả ớt",
                        "Bông cải xanh xào nấm",
                        "Tôm chiên giòn mắm tỏi",
                        "Canh bò rau thập cẩm",
                        "Cơm trắng & Dưa cải muối",
                        "Chè đậu xanh hạt sen",
                        "Trái cây tráng miệng theo mùa"
                    },
                    Features = new List<string> { "Zero Waste", "Tối ưu Logistics", "Phong phú 8 món", "Gom đơn chung cư", "Cao cấp" },
                    TotalPrice = 730000
                }
            };

            foreach (var plan in mealPlans)
            {
                var existingPlan = await context.MealPlans.FindAsync(plan.Id);
                if (existingPlan == null)
                {
                    await context.MealPlans.AddAsync(plan);
                }
            }
            await context.SaveChangesAsync();

            // Seed MealPlanIngredients (Many-to-Many join entries)
            var menuIngredients = new Dictionary<string, string[]>
            {
                { "mp1", new[] { "p9", "p13", "p14", "p15", "p2", "p1" } },
                { "mp2", new[] { "p16", "p6", "p17", "p5", "p2", "p1", "p11" } },
                { "mp3", new[] { "p10", "p6", "p19", "p18", "p15", "p14", "p1", "p11", "p13" } },
                { "mp4", new[] { "p9", "p10", "p21", "p20", "p6", "p1", "p2", "p22", "p12" } }
            };

            foreach (var pair in menuIngredients)
            {
                string mealPlanId = pair.Key;
                foreach (string productId in pair.Value)
                {
                    var exists = await context.MealPlanIngredients.AnyAsync(mpi => mpi.MealPlanId == mealPlanId && mpi.ProductId == productId);
                    if (!exists)
                    {
                        await context.MealPlanIngredients.AddAsync(new MealPlanIngredient
                        {
                            MealPlanId = mealPlanId,
                            ProductId = productId
                        });
                    }
                }
            }
            await context.SaveChangesAsync();
        }
    }
}
