using System;
using System.Threading.Tasks;
using GreenSolution.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GreenSolution.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FarmsController : ControllerBase
    {
        private readonly IFarmService _farmService;
        private readonly IProductService _productService;

        public FarmsController(IFarmService farmService, IProductService productService)
        {
            _farmService = farmService;
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var farms = await _farmService.GetAllAsync(search);
            return Ok(farms);
        }

        [HttpGet("featured")]
        public async Task<IActionResult> GetFeatured()
        {
            var featuredFarms = await _farmService.GetFeaturedAsync();
            return Ok(featuredFarms);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var farm = await _farmService.GetByIdAsync(id);
            if (farm == null)
            {
                return NotFound(new { message = "Farm not found" });
            }
            return Ok(farm);
        }

        [HttpGet("{id}/products")]
        public async Task<IActionResult> GetProductsByFarm(Guid id)
        {
            var farm = await _farmService.GetByIdAsync(id);
            if (farm == null)
            {
                return NotFound(new { message = "Farm not found" });
            }

            var products = await _productService.GetProductsAsync(
                search: null,
                category: null,
                farmId: id,
                sort: null,
                page: 1,
                limit: int.MaxValue
            );
            
            return Ok(products);
        }
    }
}
