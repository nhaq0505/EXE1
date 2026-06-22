using System;

namespace GreenSolution.Core.DTOs.Cart
{
    public class CartItemResponse
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string ProductImage { get; set; } = null!;
        public int ProductPrice { get; set; }
        public string ProductUnit { get; set; } = null!;
        public int ProductStock { get; set; }
        public string FarmName { get; set; } = null!;
        public int Quantity { get; set; }
    }
}
