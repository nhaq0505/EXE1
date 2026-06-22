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

namespace GreenSolution.API.Controllers.FarmOwner
{
    [Authorize(Roles = "FarmOwner,Admin")]
    [Route("api/farm-owner")]
    [ApiController]
    public class FarmOwnerController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FarmOwnerController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
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

            // Total revenue: only sum the price of our own products in Paid orders
            var totalRevenue = await _context.OrderItems
                .Include(oi => oi.Order)
                .Where(oi => oi.Order.PaymentStatus == PaymentStatus.Paid && oi.Product.FarmId == farm.Id)
                .SumAsync(oi => oi.Price * oi.Quantity);

            // Total products of this farm
            var totalProducts = await _context.Products
                .CountAsync(p => p.FarmId == farm.Id && p.IsActive);

            // Pending orders containing products of this farm
            var pendingOrdersCount = await _context.Orders
                .Where(o => o.Status == OrderStatus.Pending && o.OrderItems.Any(oi => oi.Product.FarmId == farm.Id))
                .CountAsync();

            // Low stock warning list: stock <= 5
            var lowStockProducts = await _context.Products
                .Where(p => p.FarmId == farm.Id && p.IsActive && p.Stock <= 5)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.Stock,
                    p.Unit,
                    p.Category,
                    p.Image
                })
                .ToListAsync();

            return Ok(new
            {
                TotalRevenue = totalRevenue,
                TotalProducts = totalProducts,
                PendingOrdersCount = pendingOrdersCount,
                LowStockProducts = lowStockProducts
            });
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
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

            return Ok(new
            {
                farm.Id,
                farm.Name,
                farm.Image,
                farm.Description,
                farm.Location,
                farm.Rating,
                farm.VideoUrl,
                farm.OwnerId
            });
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateFarmProfileDto dto)
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

            farm.Name = dto.Name;
            farm.Image = dto.Image;
            farm.Description = dto.Description;
            farm.Location = dto.Location;
            farm.VideoUrl = dto.CameraUrl ?? dto.VideoUrl ?? farm.VideoUrl;

            _context.Farms.Update(farm);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Farm profile updated successfully.",
                farm = new
                {
                    farm.Id,
                    farm.Name,
                    farm.Image,
                    farm.Description,
                    farm.Location,
                    farm.Rating,
                    farm.VideoUrl,
                    farm.OwnerId
                }
            });
        }
    }

    public class UpdateFarmProfileDto
    {
        public string Name { get; set; } = null!;
        public string Image { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Location { get; set; } = null!;
        public string? CameraUrl { get; set; }
        public string? VideoUrl { get; set; }
    }
}
