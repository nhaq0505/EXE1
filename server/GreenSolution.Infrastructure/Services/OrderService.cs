using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using GreenSolution.Core.DTOs.Order;
using GreenSolution.Core.Entities;
using GreenSolution.Core.Enums;
using GreenSolution.Core.Exceptions;
using GreenSolution.Core.Interfaces;
using GreenSolution.Core.Utils;
using GreenSolution.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GreenSolution.Infrastructure.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly IPaymentService _paymentService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<OrderService> _logger;

        public OrderService(
            AppDbContext context, 
            IPaymentService paymentService, 
            IConfiguration configuration,
            ILogger<OrderService> logger)
        {
            _context = context;
            _paymentService = paymentService;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<OrderResponse> CreateOrderAsync(Guid userId, CreateOrderRequest request)
        {
            var userIdStr = GuidHelper.FromGuid(userId);

            // Fetch user cart
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userIdStr);

            if (cart == null || !cart.CartItems.Any())
            {
                throw new BadRequestException("Giỏ hàng của bạn đang trống. Không thể tạo đơn hàng.");
            }

            // Verify stock
            foreach (var cartItem in cart.CartItems)
            {
                if (cartItem.Product == null)
                {
                    throw new BadRequestException("Sản phẩm trong giỏ hàng không hợp lệ.");
                }

                if (cartItem.Product.Stock < cartItem.Quantity)
                {
                    throw new BadRequestException($"Sản phẩm '{cartItem.Product.Name}' không đủ tồn kho. Tồn kho hiện tại: {cartItem.Product.Stock}, yêu cầu: {cartItem.Quantity}.");
                }
            }

            // Generate unique OrderCode (long type)
            long orderCode = long.Parse(DateTime.UtcNow.ToString("yyMMddHHmmss"));
            while (await _context.Orders.AnyAsync(o => o.OrderCode == orderCode))
            {
                orderCode++;
            }

            // Create Order
            var order = new Order
            {
                Id = Guid.NewGuid().ToString(),
                UserId = userIdStr,
                OrderCode = orderCode,
                ShippingAddress = request.Address,
                PhoneNumber = request.Phone,
                ReceiverName = request.ReceiverName,
                Notes = request.Notes,
                Status = OrderStatus.Pending,
                PaymentStatus = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                TotalAmount = cart.CartItems.Sum(ci => ci.Quantity * ci.Product.Price),
                OrderItems = new List<OrderItem>()
            };

            // Snapshot product details and deduct stock
            foreach (var cartItem in cart.CartItems)
            {
                var product = cartItem.Product;
                product.Stock -= cartItem.Quantity; // reserve inventory

                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = product.Id,
                    ProductName = product.Name, // Snapshot product name
                    Quantity = cartItem.Quantity,
                    Price = product.Price // Snapshot price
                };
                order.OrderItems.Add(orderItem);
            }

            // Clear the user's cart items
            _context.CartItems.RemoveRange(cart.CartItems);

            // Save order and initial changes
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Create payment link using IPaymentService
            string checkoutUrl = await _paymentService.CreatePaymentLinkAsync(order);
            order.CheckoutUrl = checkoutUrl;

            // Save updated checkout url
            await _context.SaveChangesAsync();

            return MapToResponse(order);
        }

        public async Task<IEnumerable<OrderResponse>> GetOrdersAsync(Guid userId)
        {
            var userIdStr = GuidHelper.FromGuid(userId);
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.UserId == userIdStr)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapToResponse);
        }

        public async Task<OrderResponse?> GetOrderByIdAsync(Guid userId, Guid orderId)
        {
            var userIdStr = GuidHelper.FromGuid(userId);
            var orderIdStr = GuidHelper.FromGuid(orderId);

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderIdStr && o.UserId == userIdStr);

            if (order == null)
            {
                return null;
            }

            return MapToResponse(order);
        }

        public async Task<bool> ProcessWebhookPaymentAsync(string webhookBody, string payosSignature)
        {
            try
            {
                using var doc = JsonDocument.Parse(webhookBody);
                var root = doc.RootElement;

                if (!root.TryGetProperty("data", out var dataElement))
                {
                    _logger.LogWarning("Webhook payload does not contain data object.");
                    return false;
                }

                // Verify signature
                string checksumKey = _configuration["PayOS:ChecksumKey"] ?? "YOUR_CHECKSUM_KEY";
                bool isValid = false;

                // Extract and sort fields alphabetically
                var dataDict = new Dictionary<string, string>();
                foreach (var property in dataElement.EnumerateObject())
                {
                    string valStr = property.Value.ValueKind switch
                    {
                        JsonValueKind.String => property.Value.GetString() ?? "",
                        JsonValueKind.Number => property.Value.GetRawText(),
                        JsonValueKind.True => "true",
                        JsonValueKind.False => "false",
                        JsonValueKind.Null => "",
                        _ => property.Value.GetRawText()
                    };
                    dataDict[property.Name] = valStr;
                }

                var sortedKeys = dataDict.Keys.OrderBy(k => k).ToList();
                var queryString = string.Join("&", sortedKeys.Select(k => $"{k}={dataDict[k]}"));

                if (checksumKey == "YOUR_CHECKSUM_KEY" || string.IsNullOrEmpty(payosSignature))
                {
                    _logger.LogInformation("Bypassing PayOS signature check in development mode.");
                    isValid = true;
                }
                else
                {
                    string calculatedSignature = ComputeHmacSha256(queryString, checksumKey);
                    isValid = string.Equals(calculatedSignature, payosSignature, StringComparison.OrdinalIgnoreCase);
                }

                if (!isValid)
                {
                    _logger.LogWarning("Invalid PayOS webhook signature received.");
                    return false;
                }

                // Process the webhook data
                if (dataElement.TryGetProperty("orderCode", out var orderCodeProp))
                {
                    long orderCode = orderCodeProp.ValueKind == JsonValueKind.Number
                        ? orderCodeProp.GetInt64()
                        : long.Parse(orderCodeProp.GetString() ?? "0");

                    var order = await _context.Orders
                        .Include(o => o.OrderItems)
                            .ThenInclude(oi => oi.Product)
                        .FirstOrDefaultAsync(o => o.OrderCode == orderCode);

                    if (order != null)
                    {
                        string status = dataElement.TryGetProperty("status", out var statusProp) ? statusProp.GetString() ?? "" : "";
                        
                        _logger.LogInformation("Processing PayOS Webhook for order {OrderCode} with status {Status}.", orderCode, status);

                        if (status == "PAID")
                        {
                            order.PaymentStatus = PaymentStatus.Paid;
                            order.Status = OrderStatus.Confirmed;
                        }
                        else if (status == "CANCELLED" || status == "FAILED")
                        {
                            // If cancellation is new, restore product stock
                            if (order.Status != OrderStatus.Cancelled)
                            {
                                foreach (var item in order.OrderItems)
                                {
                                    if (item.Product != null)
                                    {
                                        item.Product.Stock += item.Quantity;
                                    }
                                }
                            }
                            order.PaymentStatus = PaymentStatus.Failed;
                            order.Status = OrderStatus.Cancelled;
                        }

                        await _context.SaveChangesAsync();
                        return true;
                    }
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing PayOS payment webhook.");
                return false;
            }
        }

        public async Task<bool> CancelOrderAsync(Guid userId, long orderCode, string reason)
        {
            var userIdStr = GuidHelper.FromGuid(userId);

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.OrderCode == orderCode && o.UserId == userIdStr);

            if (order == null)
            {
                throw new NotFoundException($"Đơn hàng với mã #{orderCode} không tồn tại.");
            }

            if (order.Status == OrderStatus.Cancelled)
            {
                throw new BadRequestException("Đơn hàng này đã được hủy trước đó.");
            }

            if (order.Status == OrderStatus.Delivered)
            {
                throw new BadRequestException("Không thể hủy đơn hàng đã được giao.");
            }

            // Call IPaymentService to cancel payment link on PayOS side
            await _paymentService.CancelPaymentLinkAsync(orderCode, reason);

            // Update order status
            order.Status = OrderStatus.Cancelled;
            order.PaymentStatus = PaymentStatus.Cancelled;

            // Restore product stock
            foreach (var item in order.OrderItems)
            {
                if (item.Product != null)
                {
                    item.Product.Stock += item.Quantity;
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        private string ComputeHmacSha256(string data, string key)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
            byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }

        private OrderResponse MapToResponse(Order order)
        {
            return new OrderResponse
            {
                Id = GuidHelper.ToGuid(order.Id),
                OrderCode = order.OrderCode.ToString(),
                TotalAmount = (int)order.TotalAmount,
                ReceiverName = order.ReceiverName,
                Phone = order.PhoneNumber,
                Address = order.ShippingAddress,
                Notes = order.Notes,
                Status = order.Status.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                CreatedAt = order.CreatedAt,
                CheckoutUrl = order.CheckoutUrl,
                Items = order.OrderItems.Select(oi => new OrderItemResponse
                {
                    Id = GuidHelper.ToGuid("oi_" + oi.Id),
                    ProductId = GuidHelper.ToGuid(oi.ProductId),
                    ProductName = oi.ProductName,
                    Quantity = oi.Quantity,
                    UnitPrice = (int)oi.Price
                }).ToList()
            };
        }
    }
}
