using System;

namespace GreenSolution.Core.DTOs.Admin
{
    public class BestSellerProductDto
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public int QuantitySold { get; set; }
        public int TotalRevenue { get; set; }
    }
}
