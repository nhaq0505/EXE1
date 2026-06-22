using System;

namespace GreenSolution.Core.DTOs.Order
{
    public class OrderItemResponse
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public int Quantity { get; set; }
        public int UnitPrice { get; set; }
    }
}
