using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GreenSolution.Infrastructure.Data;
using GreenSolution.Core.Entities;
using GreenSolution.Core.Enums;
using GreenSolution.Core.Utils;
using GreenSolution.API.DTOs.Order;
using GreenSolution.API.DTOs.Admin;

namespace GreenSolution.API.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [Route("api/admin/orders")]
    [ApiController]
    public class AdminOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminOrdersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? status, 
            [FromQuery] int page = 1, 
            [FromQuery] int limit = 10)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            var query = _context.Orders.Include(o => o.OrderItems).AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                if (Enum.TryParse<OrderStatus>(status, true, out var parsedStatus))
                {
                    query = query.Where(o => o.Status == parsedStatus);
                }
            }

            var totalOrders = await query.CountAsync();
            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            var response = orders.Select(MapToResponse).ToList();

            return Ok(new
            {
                Total = totalOrders,
                Page = page,
                Limit = limit,
                Items = response
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var stringId = GuidHelper.FromGuid(id);
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == stringId);

            if (order == null)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng." });
            }

            return Ok(MapToResponse(order));
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Status))
            {
                return BadRequest("Yêu cầu không hợp lệ.");
            }

            if (!Enum.TryParse<OrderStatus>(request.Status, true, out var newStatus))
            {
                return BadRequest("Trạng thái đơn hàng không hợp lệ.");
            }

            var stringId = GuidHelper.FromGuid(id);
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == stringId);

            if (order == null)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng." });
            }

            // Restore product stock if order is cancelled and it wasn't cancelled before
            if (newStatus == OrderStatus.Cancelled && order.Status != OrderStatus.Cancelled)
            {
                foreach (var item in order.OrderItems)
                {
                    if (item.Product != null)
                    {
                        item.Product.Stock += item.Quantity;
                    }
                }
                order.PaymentStatus = PaymentStatus.Cancelled;
            }

            order.Status = newStatus;
            await _context.SaveChangesAsync();

            return Ok(MapToResponse(order));
        }

        #region Helper Methods

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
                Items = order.OrderItems.Select(oi => new GreenSolution.Core.DTOs.Order.OrderItemResponse
                {
                    Id = GuidHelper.ToGuid("oi_" + oi.Id),
                    ProductId = GuidHelper.ToGuid(oi.ProductId),
                    ProductName = oi.ProductName,
                    Quantity = oi.Quantity,
                    UnitPrice = (int)oi.Price
                }).ToList()
            };
        }

        #endregion
    }
}
