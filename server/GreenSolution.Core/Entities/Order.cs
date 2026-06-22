using GreenSolution.Core.Enums;
using System;
using System.Collections.Generic;

namespace GreenSolution.Core.Entities
{
    public class Order
    {
        public string Id { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public User User { get; set; } = null!;

        public long OrderCode { get; set; }
        public decimal TotalAmount { get; set; }
        public string ShippingAddress { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string ReceiverName { get; set; } = null!;
        public string? Notes { get; set; }
        public string? CheckoutUrl { get; set; }
        
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
