using System;
using System.Collections.Generic;

namespace GreenSolution.Core.DTOs.Cart
{
    public class CartResponse
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public List<CartItemResponse> Items { get; set; } = new List<CartItemResponse>();
        public int TotalAmount { get; set; }
    }
}
