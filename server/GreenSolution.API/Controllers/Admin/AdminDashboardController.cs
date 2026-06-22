using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GreenSolution.Infrastructure.Data;
using GreenSolution.Core.Enums;
using GreenSolution.Core.Utils;
using GreenSolution.API.DTOs.Admin;

namespace GreenSolution.API.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [Route("api/admin/dashboard")]
    [ApiController]
    public class AdminDashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminDashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardStats()
        {
            // Total Orders
            var totalOrders = await _context.Orders.CountAsync();

            // Total Registered Users with role 'User'
            var totalUsers = await _context.Users.CountAsync(u => u.Role == UserRole.User);

            // Total Revenue from Paid orders
            var totalRevenueDecimal = await _context.Orders
                .Where(o => o.PaymentStatus == PaymentStatus.Paid)
                .SumAsync(o => o.TotalAmount);
            var totalRevenue = (int)totalRevenueDecimal;

            // Top 5 Best Sellers
            var bestSellersData = await _context.OrderItems
                .Include(oi => oi.Order)
                .Where(oi => oi.Order.PaymentStatus == PaymentStatus.Paid)
                .GroupBy(oi => new { oi.ProductId, oi.ProductName })
                .Select(g => new
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.ProductName,
                    QuantitySold = g.Sum(oi => oi.Quantity),
                    TotalRevenue = (int)g.Sum(oi => oi.Quantity * oi.Price)
                })
                .OrderByDescending(b => b.QuantitySold)
                .Take(5)
                .ToListAsync();

            var bestSellers = bestSellersData.Select(b => new GreenSolution.Core.DTOs.Admin.BestSellerProductDto
            {
                ProductId = GuidHelper.ToGuid(b.ProductId),
                ProductName = b.ProductName,
                QuantitySold = b.QuantitySold,
                TotalRevenue = b.TotalRevenue
            }).ToList();

            var response = new DashboardResponse
            {
                TotalOrders = totalOrders,
                TotalUsers = totalUsers,
                TotalRevenue = totalRevenue,
                BestSellers = bestSellers
            };

            return Ok(response);
        }
    }
}
