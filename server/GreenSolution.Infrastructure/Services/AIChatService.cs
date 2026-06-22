using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using GreenSolution.Core.DTOs.AI;
using GreenSolution.Core.Interfaces;
using GreenSolution.Core.Utils;
using GreenSolution.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace GreenSolution.Infrastructure.Services
{
    public class AIChatService : IAIChatService
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public AIChatService(AppDbContext context, HttpClient httpClient, IConfiguration configuration)
        {
            _context = context;
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"] ?? string.Empty;
        }

        public async Task<ChatResponse> GenerateResponseAsync(ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(_apiKey) || _apiKey == "YOUR_GEMINI_API_KEY")
            {
                return new ChatResponse
                {
                    ResponseText = "Chế độ demo: Chưa cấu hình Gemini API Key trên Server. Vui lòng liên hệ Admin!"
                };
            }

            try
            {
                // 1. Fetch active Farms, Products and MealPlans
                var activeFarms = await _context.Farms
                    .Where(f => f.IsActive)
                    .ToListAsync();

                var activeFarmsSet = activeFarms.Select(f => f.Id).ToHashSet();

                var products = await _context.Products
                    .Include(p => p.Farm)
                    .Where(p => p.IsActive)
                    .ToListAsync();

                // Only include products from active farms
                var activeProducts = products
                    .Where(p => activeFarmsSet.Contains(p.FarmId))
                    .ToList();

                var mealPlans = await _context.MealPlans
                    .Include(mp => mp.MealPlanIngredients)
                        .ThenInclude(mpi => mpi.Product)
                    .ToListAsync();

                // 2. Build the dynamic system prompt
                var productListLines = activeProducts.Select(p =>
                {
                    var guidId = GuidHelper.ResolveIdToGuid(p.Id);
                    var legacyId = GuidHelper.FromGuid(guidId);
                    var farmName = p.Farm?.Name ?? "N/A";
                    return $"- ID:[{legacyId}] Tên:[{p.Name}] Giá:[{(int)p.Price}]đ Tồn kho:[{p.Stock}]{p.Unit} Nông trại:[{farmName}]";
                });
                var productList = string.Join("\n", productListLines);

                var mealPlanListLines = mealPlans.Select(mp =>
                {
                    var guidId = GuidHelper.ResolveIdToGuid(mp.Id);
                    var legacyId = GuidHelper.FromGuid(guidId);

                    // Compute dynamic total price from ingredients
                    var totalPrice = mp.MealPlanIngredients.Any()
                        ? mp.MealPlanIngredients.Sum(mpi => mpi.Product.Price)
                        : mp.TotalPrice;

                    var dishesStr = string.Join(", ", mp.Dishes);
                    return $"- [ID:{legacyId}] {mp.Title} ({mp.TargetAudience}) - GIÁ: {(int)totalPrice}đ: {dishesStr}";
                });
                var menuList = string.Join("\n", mealPlanListLines);

                var systemInstruction = $@"Bạn là trợ lý ảo THÔNG MINH của Green Solution.
Nhiệm vụ: Hỗ trợ khách hàng tìm kiếm nông sản, tư vấn thực đơn và đề xuất sản phẩm CHÍNH XÁC theo ngân sách.

DANH SÁCH SẢN PHẨM, GIÁ & TỒN KHO TẠI NÔNG TRẠI:
{productList}
(Lưu ý: Tồn kho là số lượng hiện có tại các nông trại/cửa hàng cung cấp, KHÔNG phải kho của app.)

THỰC ĐƠN MẪU:
{menuList}

=== QUY TẮC PHẢN HỒI (BẮT BUỘC) ===
1. Khi liệt kê sản phẩm/nông trại: Dùng icon (vd: 🥬 Rau củ) và dấu gạch đầu dòng (*). Trình bày sạch sẽ.
2. Khi gợi ý theo ngân sách (vd: 200k): PHẢI chọn món lẻ hoặc thực đơn sao cho Tổng Giá < Ngân sách. 
3. THẺ HÀNH ĐỘNG (QUAN TRỌNG NHẤT): 
   - Mọi câu trả lời có gợi ý sản phẩm/thực đơn PHẢI kết thúc bằng một thẻ tag ở dòng cuối cùng.
   - Nếu dùng menu CÓ SẴN: Gắn [[MENU:mpX]]
   - Nếu TỰ PHỐI đồ lẻ: Gắn [[CUSTOM_MENU:p1,p2,p3]] (liệt kê ít nhất 3-5 sản phẩm phù hợp).
   - KHÔNG bao giờ được quên thẻ tag này, nếu không khách sẽ không thể mua hàng.
4. Trả lời ngắn gọn, tự nhiên, tối đa 100 từ.
5. QUẢN LÝ TỒN KHO (của nông trại/cửa hàng):
    - Form trả lời là : ""Trong kho của bạn còn ? Kg"" để có thể biết và nhập hàng";

                // 3. Build contents payload from history + new message
                var contentsList = new List<object>();

                if (request.History != null)
                {
                    foreach (var h in request.History)
                    {
                        var role = h.Role == "model" ? "model" : "user";
                        var partsList = new List<object>();
                        if (h.Parts != null)
                        {
                            foreach (var p in h.Parts)
                            {
                                partsList.Add(new { text = p.Text });
                            }
                        }
                        contentsList.Add(new
                        {
                            role = role,
                            parts = partsList
                        });
                    }
                }

                // Add the current user prompt
                contentsList.Add(new
                {
                    role = "user",
                    parts = new[] { new { text = request.Message } }
                });

                // Prepare final JSON request payload
                var payload = new
                {
                    contents = contentsList,
                    systemInstruction = new
                    {
                        parts = new[]
                        {
                            new { text = systemInstruction }
                        }
                    }
                };

                var jsonOptions = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };
                var jsonContent = JsonSerializer.Serialize(payload, jsonOptions);
                var stringContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                // 4. Send HTTP POST request to Google Gemini API
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";
                var response = await _httpClient.PostAsync(url, stringContent);

                if (!response.IsSuccessStatusCode)
                {
                    var errorMsg = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Gemini API responded with error status: {response.StatusCode}, Content: {errorMsg}");
                    return new ChatResponse
                    {
                        ResponseText = "Chế độ demo: Chưa cấu hình Gemini API Key trên Server. Vui lòng liên hệ Admin!"
                    };
                }

                var responseJson = await response.Content.ReadAsStringAsync();
                
                // 5. Decode text response from Gemini
                using var doc = JsonDocument.Parse(responseJson);
                if (doc.RootElement.TryGetProperty("candidates", out var candidates) && 
                    candidates.GetArrayLength() > 0)
                {
                    var candidate = candidates[0];
                    if (candidate.TryGetProperty("content", out var content) &&
                        content.TryGetProperty("parts", out var parts) &&
                        parts.GetArrayLength() > 0)
                    {
                        var text = parts[0].GetProperty("text").GetString();
                        if (!string.IsNullOrEmpty(text))
                        {
                            return new ChatResponse
                            {
                                ResponseText = text
                            };
                        }
                    }
                }

                return new ChatResponse
                {
                    ResponseText = "Chế độ demo: Chưa cấu hình Gemini API Key trên Server. Vui lòng liên hệ Admin!"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in AIChatService: {ex.Message}");
                return new ChatResponse
                {
                    ResponseText = "Chế độ demo: Chưa cấu hình Gemini API Key trên Server. Vui lòng liên hệ Admin!"
                };
            }
        }
    }
}
