using System;
using System.Threading.Tasks;
using GreenSolution.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GreenSolution.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? category,
            [FromQuery] Guid? farmId,
            [FromQuery] string? sort,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            var products = await _productService.GetProductsAsync(search, category, farmId, sort, page, limit);
            var totalCount = await _productService.GetProductsCountAsync(search, category, farmId);

            return Ok(new
            {
                items = products,
                totalCount = totalCount,
                page = page,
                limit = limit
            });
        }

        [HttpGet("featured")]
        public async Task<IActionResult> GetFeatured()
        {
            var featured = await _productService.GetFeaturedAsync();
            return Ok(featured);
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _productService.GetCategoriesAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var product = await _productService.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }
            return Ok(product);
        }
    }
}
