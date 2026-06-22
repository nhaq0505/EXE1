using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GreenSolution.Infrastructure.Data;
using GreenSolution.Core.Entities;
using GreenSolution.Core.Utils;
using GreenSolution.API.DTOs;
using GreenSolution.API.DTOs.Admin;

namespace GreenSolution.API.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [Route("api/admin/products")]
    [ApiController]
    public class AdminProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminProductsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _context.Products.Include(p => p.Farm).ToListAsync();
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
            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
        {
            if (request == null)
            {
                return BadRequest("Yêu cầu không hợp lệ.");
            }

            var farmIdStr = GuidHelper.FromGuid(request.FarmId);
            var farmExists = await _context.Farms.AnyAsync(f => f.Id == farmIdStr);
            if (!farmExists)
            {
                return BadRequest(new { message = "Không tìm thấy trang trại liên kết." });
            }

            var newGuid = Guid.NewGuid();
            var product = new Product
            {
                Id = GuidHelper.FromGuid(newGuid),
                FarmId = farmIdStr,
                Name = request.Name,
                Image = request.Image,
                Price = request.Price,
                Category = request.Category,
                Unit = request.Unit,
                Stock = request.Stock,
                IsActive = true
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Load Farm name to include in response
            var farm = await _context.Farms.FirstOrDefaultAsync(f => f.Id == farmIdStr);

            var response = new ProductResponse
            {
                Id = newGuid,
                FarmId = request.FarmId,
                FarmName = farm != null ? farm.Name : string.Empty,
                Name = product.Name,
                Image = product.Image,
                Price = (int)product.Price,
                Category = product.Category,
                Unit = product.Unit,
                Stock = product.Stock,
                IsActive = product.IsActive
            };

            return CreatedAtAction(nameof(GetAll), new { id = response.Id }, response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest request)
        {
            if (request == null)
            {
                return BadRequest("Yêu cầu không hợp lệ.");
            }

            var stringId = GuidHelper.FromGuid(id);
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == stringId);
            if (product == null)
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm." });
            }

            var farmIdStr = GuidHelper.FromGuid(request.FarmId);
            var farmExists = await _context.Farms.AnyAsync(f => f.Id == farmIdStr);
            if (!farmExists)
            {
                return BadRequest(new { message = "Không tìm thấy trang trại liên kết." });
            }

            product.FarmId = farmIdStr;
            product.Name = request.Name;
            product.Image = request.Image;
            product.Price = request.Price;
            product.Category = request.Category;
            product.Unit = request.Unit;
            product.Stock = request.Stock;
            product.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            var farm = await _context.Farms.FirstOrDefaultAsync(f => f.Id == farmIdStr);

            var response = new ProductResponse
            {
                Id = id,
                FarmId = request.FarmId,
                FarmName = farm != null ? farm.Name : string.Empty,
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
        public async Task<IActionResult> Delete(Guid id)
        {
            var stringId = GuidHelper.FromGuid(id);
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == stringId);
            if (product == null)
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm." });
            }

            product.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa mềm sản phẩm thành công." });
        }

        [HttpPatch("{id}/stock")]
        public async Task<IActionResult> UpdateStock(Guid id, [FromBody] UpdateProductStockRequest request)
        {
            if (request == null)
            {
                return BadRequest("Yêu cầu không hợp lệ.");
            }

            var stringId = GuidHelper.FromGuid(id);
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == stringId);
            if (product == null)
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm." });
            }

            product.Stock = request.Stock;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật tồn kho thành công.", stock = product.Stock });
        }
    }
}
