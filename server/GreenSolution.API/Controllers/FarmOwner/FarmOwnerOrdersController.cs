using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GreenSolution.Infrastructure.Data;
using GreenSolution.Core.Entities;
using GreenSolution.Core.Enums;
using GreenSolution.Core.Utils;
using GreenSolution.API.DTOs.Order;

namespace GreenSolution.API.Controllers.FarmOwner
{
    [Authorize(Roles = "FarmOwner,Admin")]
    [Route("api/farm-owner/orders")]
    [ApiController]
    public class FarmOwnerOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FarmOwnerOrdersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders(
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var farm = await _context.Farms.FirstOrDefaultAsync(f => f.OwnerId == userId);

            if (farm == null && User.IsInRole("Admin"))
            {
                farm = await _context.Farms.FirstOrDefaultAsync(f => f.Id == "6d8319bd-62db-1cc1-55ab-251ccaca5645")
                       ?? await _context.Farms.FirstOrDefaultAsync();
            }

            if (farm == null)
            {
                return NotFound(new { message = "No farm found for the current user." });
            }

            var query = _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Where(o => o.OrderItems.Any(oi => oi.Product.FarmId == farm.Id));

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

            var response = orders.Select(o =>
            {
                var farmItems = o.OrderItems
                    .Where(oi => oi.Product != null && oi.Product.FarmId == farm.Id)
                    .ToList();

                var farmTotalAmount = farmItems.Sum(oi => oi.Price * oi.Quantity);

                return new OrderResponse
                {
                    Id = GuidHelper.ToGuid(o.Id),
                    OrderCode = o.OrderCode.ToString(),
                    TotalAmount = (int)farmTotalAmount,
                    ReceiverName = o.ReceiverName,
                    Phone = o.PhoneNumber,
                    Address = o.ShippingAddress,
                    Notes = o.Notes,
                    Status = o.Status.ToString(),
                    PaymentStatus = o.PaymentStatus.ToString(),
                    CreatedAt = o.CreatedAt,
                    CheckoutUrl = o.CheckoutUrl,
                    Items = farmItems.Select(oi => new GreenSolution.Core.DTOs.Order.OrderItemResponse
                    {
                        Id = GuidHelper.ToGuid("oi_" + oi.Id),
                        ProductId = GuidHelper.ToGuid(oi.ProductId),
                        ProductName = oi.ProductName,
                        Quantity = oi.Quantity,
                        UnitPrice = (int)oi.Price
                    }).ToList()
                };
            }).ToList();

            return Ok(new
            {
                Total = totalOrders,
                Page = page,
                Limit = limit,
                Items = response
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var farm = await _context.Farms.FirstOrDefaultAsync(f => f.OwnerId == userId);

            if (farm == null && User.IsInRole("Admin"))
            {
                farm = await _context.Farms.FirstOrDefaultAsync(f => f.Id == "6d8319bd-62db-1cc1-55ab-251ccaca5645")
                       ?? await _context.Farms.FirstOrDefaultAsync();
            }

            if (farm == null)
            {
                return NotFound(new { message = "No farm found for the current user." });
            }

            var stringId = GuidHelper.FromGuid(id);
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == stringId);

            if (order == null)
            {
                return NotFound(new { message = "Order not found." });
            }

            var farmItems = order.OrderItems
                .Where(oi => oi.Product != null && oi.Product.FarmId == farm.Id)
                .ToList();

            if (!farmItems.Any())
            {
                return StatusCode(403, new { message = "You do not have permission to view this order." });
            }

            var farmTotalAmount = farmItems.Sum(oi => oi.Price * oi.Quantity);

            var response = new OrderResponse
            {
                Id = GuidHelper.ToGuid(order.Id),
                OrderCode = order.OrderCode.ToString(),
                TotalAmount = (int)farmTotalAmount,
                ReceiverName = order.ReceiverName,
                Phone = order.PhoneNumber,
                Address = order.ShippingAddress,
                Notes = order.Notes,
                Status = order.Status.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                CreatedAt = order.CreatedAt,
                CheckoutUrl = order.CheckoutUrl,
                Items = farmItems.Select(oi => new GreenSolution.Core.DTOs.Order.OrderItemResponse
                {
                    Id = GuidHelper.ToGuid("oi_" + oi.Id),
                    ProductId = GuidHelper.ToGuid(oi.ProductId),
                    ProductName = oi.ProductName,
                    Quantity = oi.Quantity,
                    UnitPrice = (int)oi.Price
                }).ToList()
            };

            return Ok(response);
        }
    }
}
