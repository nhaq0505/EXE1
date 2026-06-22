using System.Collections.Generic;

namespace GreenSolution.Core.DTOs.Admin
{
    public class DashboardResponse
    {
        public int TotalOrders { get; set; }
        public int TotalUsers { get; set; }
        public int TotalRevenue { get; set; }
        public List<BestSellerProductDto> BestSellers { get; set; } = new List<BestSellerProductDto>();
    }
}
