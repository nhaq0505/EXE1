using System;
using System.Collections.Generic;

namespace GreenSolution.Core.DTOs.Order
{
    public class OrderResponse
    {
        public Guid Id { get; set; }
        public string OrderCode { get; set; } = null!;
        public int TotalAmount { get; set; }
        public string ReceiverName { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string? Notes { get; set; }
        public string Status { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public List<OrderItemResponse> Items { get; set; } = new List<OrderItemResponse>();
        public string? CheckoutUrl { get; set; }
    }
}
