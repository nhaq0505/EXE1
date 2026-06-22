using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GreenSolution.Core.DTOs.Order;

namespace GreenSolution.Core.Interfaces
{
    public interface IOrderService
    {
        Task<OrderResponse> CreateOrderAsync(Guid userId, CreateOrderRequest request);
        Task<IEnumerable<OrderResponse>> GetOrdersAsync(Guid userId);
        Task<OrderResponse?> GetOrderByIdAsync(Guid userId, Guid orderId);
        Task<bool> ProcessWebhookPaymentAsync(string webhookBody, string payosSignature);
        Task<bool> CancelOrderAsync(Guid userId, long orderCode, string reason);
    }
}
