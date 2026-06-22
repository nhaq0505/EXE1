using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GreenSolution.Infrastructure.Data;
using GreenSolution.Core.Entities;
using GreenSolution.Core.Utils;
using GreenSolution.API.DTOs;

namespace GreenSolution.API.Controllers.FarmOwner
{
    [Authorize(Roles = "FarmOwner,Admin")]
    [Route("api/farm-owner/products")]
    [ApiController]
    public class FarmOwnerProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FarmOwnerProductsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts(
            [FromQuery] string? search,
            [FromQuery] string? category,
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

            var query = _context.Products.Include(p => p.Farm).Where(p => p.FarmId == farm.Id);

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category == category);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name.Contains(search));
            }

            var totalCount = await query.CountAsync();
            var products = await query
                .OrderBy(p => p.Name)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            var response = products.Select(p => new ProductResponse
            {
                Id = GuidHelper.ToGuid(p.Id),
                FarmId = GuidHelper.ToGuid(p.FarmId),
                FarmName = p.Farm != null ? p.Farm.Name : string.Empty,
                Name = p.Name,
                Image = p.Image,
                Price = (int)p.Price,
                Category = p.Category,
                Unit = p.Unit,
                Stock = p.Stock,
                IsActive = p.IsActive
            });

            return Ok(new
            {
                items = response,
                totalCount = totalCount,
                page = page,
                limit = limit
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateFarmProductDto dto)
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

            var newGuid = Guid.NewGuid();
            var product = new Product
            {
                Id = GuidHelper.FromGuid(newGuid),
                FarmId = farm.Id,
                Name = dto.Name,
                Image = dto.Image,
                Price = dto.Price,
                Category = dto.Category,
                Unit = dto.Unit,
                Stock = dto.Stock,
                IsActive = true
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var response = new ProductResponse
            {
                Id = newGuid,
                FarmId = GuidHelper.ToGuid(farm.Id),
                FarmName = farm.Name,
                Name = product.Name,
                Image = product.Image,
                Price = (int)product.Price,
                Category = product.Category,
                Unit = product.Unit,
                Stock = product.Stock,
                IsActive = product.IsActive
            };

            return CreatedAtAction(nameof(GetProducts), new { id = response.Id }, response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateFarmProductDto dto)
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

            var productIdStr = GuidHelper.FromGuid(id);
            var product = await _context.Products.Include(p => p.Farm).FirstOrDefaultAsync(p => p.Id == productIdStr);

            if (product == null)
            {
                return NotFound(new { message = "Product not found." });
            }

            if (product.FarmId != farm.Id)
            {
                return StatusCode(403, new { message = "You do not have permission to modify this product." });
            }

            product.Name = dto.Name;
            product.Image = dto.Image;
            product.Price = dto.Price;
            product.Category = dto.Category;
            product.Unit = dto.Unit;
            product.Stock = dto.Stock;
            if (dto.IsActive.HasValue)
            {
                product.IsActive = dto.IsActive.Value;
            }

            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            var response = new ProductResponse
            {
                Id = id,
                FarmId = GuidHelper.ToGuid(product.FarmId),
                FarmName = product.Farm != null ? product.Farm.Name : string.Empty,
                Name = product.Name,
                Image = product.Image,
                Price = (int)product.Price,
                Category = product.Category,
                Unit = product.Unit,
                Stock = product.Stock,
                IsActive = product.IsActive
            };

            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(Guid id)
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

            var productIdStr = GuidHelper.FromGuid(id);
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productIdStr);

            if (product == null)
            {
                return NotFound(new { message = "Product not found." });
            }

            if (product.FarmId != farm.Id)
            {
                return StatusCode(403, new { message = "You do not have permission to delete this product." });
            }

            product.IsActive = false;
            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product soft-deleted successfully." });
        }

        [HttpPatch("{id}/stock")]
        public async Task<IActionResult> UpdateStock(Guid id, [FromBody] UpdateStockDto dto)
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

            var productIdStr = GuidHelper.FromGuid(id);
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productIdStr);

            if (product == null)
            {
                return NotFound(new { message = "Product not found." });
            }

            if (product.FarmId != farm.Id)
            {
                return StatusCode(403, new { message = "You do not have permission to update stock for this product." });
            }

            product.Stock = dto.Stock;
            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product stock updated successfully.", stock = product.Stock });
        }
    }

    public class CreateFarmProductDto
    {
        public string Name { get; set; } = null!;
        public string Image { get; set; } = null!;
        public decimal Price { get; set; }
        public string Category { get; set; } = null!;
        public string Unit { get; set; } = null!;
        public int Stock { get; set; }
    }

    public class UpdateFarmProductDto
    {
        public string Name { get; set; } = null!;
        public string Image { get; set; } = null!;
        public decimal Price { get; set; }
        public string Category { get; set; } = null!;
        public string Unit { get; set; } = null!;
        public int Stock { get; set; }
        public bool? IsActive { get; set; }
    }

    public class UpdateStockDto
    {
        public int Stock { get; set; }
    }
}
