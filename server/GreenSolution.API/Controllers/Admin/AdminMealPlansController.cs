using System;
using System.Collections.Generic;
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
    [Route("api/admin/meal-plans")]
    [ApiController]
    public class AdminMealPlansController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminMealPlansController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var mealPlans = await _context.MealPlans
                .Include(mp => mp.MealPlanIngredients)
                    .ThenInclude(mpi => mpi.Product)
                        .ThenInclude(p => p.Farm)
                .ToListAsync();

            var response = mealPlans.Select(MapToResponse);
            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMealPlanRequest request)
        {
            if (request == null)
            {
                return BadRequest("Yêu cầu không hợp lệ.");
            }

            // Verify and fetch products for ingredients
            var ingredientIdsStr = request.IngredientProductIds
                .Select(id => GuidHelper.FromGuid(id))
                .ToList();

            var products = await _context.Products
                .Where(p => ingredientIdsStr.Contains(p.Id))
                .ToListAsync();

            decimal totalPrice = products.Sum(p => p.Price);

            var newGuid = Guid.NewGuid();
            var mealPlan = new MealPlan
            {
                Id = GuidHelper.FromGuid(newGuid),
                Title = request.Title,
                TargetAudience = request.TargetAudience,
                Calories = request.Calories,
                Dishes = request.Dishes ?? new List<string>(),
                Features = request.Features ?? new List<string>(),
                TotalPrice = totalPrice,
                IsActive = true
            };

            _context.MealPlans.Add(mealPlan);
            await _context.SaveChangesAsync();

            // Create many-to-many ingredient links
            foreach (var product in products)
            {
                _context.MealPlanIngredients.Add(new MealPlanIngredient
                {
                    MealPlanId = mealPlan.Id,
                    ProductId = product.Id
                });
            }
            await _context.SaveChangesAsync();

            // Fetch fully populated meal plan to return
            var fullyPopulated = await _context.MealPlans
                .Include(mp => mp.MealPlanIngredients)
                    .ThenInclude(mpi => mpi.Product)
                        .ThenInclude(p => p.Farm)
                .FirstOrDefaultAsync(mp => mp.Id == mealPlan.Id);

            return CreatedAtAction(nameof(GetAll), new { id = newGuid }, MapToResponse(fullyPopulated!));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMealPlanRequest request)
        {
            if (request == null)
            {
                return BadRequest("Yêu cầu không hợp lệ.");
            }

            var stringId = GuidHelper.FromGuid(id);
            var mealPlan = await _context.MealPlans
                .Include(mp => mp.MealPlanIngredients)
                .FirstOrDefaultAsync(mp => mp.Id == stringId);

            if (mealPlan == null)
            {
                return NotFound(new { message = "Không tìm thấy thực đơn mẫu." });
            }

            // Verify and fetch new products
            var ingredientIdsStr = request.IngredientProductIds
                .Select(prodId => GuidHelper.FromGuid(prodId))
                .ToList();

            var products = await _context.Products
                .Where(p => ingredientIdsStr.Contains(p.Id))
                .ToListAsync();

            decimal totalPrice = products.Sum(p => p.Price);

            // Update meal plan fields
            mealPlan.Title = request.Title;
            mealPlan.TargetAudience = request.TargetAudience;
            mealPlan.Calories = request.Calories;
            mealPlan.Dishes = request.Dishes ?? new List<string>();
            mealPlan.Features = request.Features ?? new List<string>();
            mealPlan.TotalPrice = totalPrice;
            mealPlan.IsActive = request.IsActive;

            // Remove old many-to-many ingredients
            var oldIngredients = await _context.MealPlanIngredients
                .Where(mpi => mpi.MealPlanId == mealPlan.Id)
                .ToListAsync();
            _context.MealPlanIngredients.RemoveRange(oldIngredients);

            // Add new many-to-many ingredients
            foreach (var product in products)
            {
                _context.MealPlanIngredients.Add(new MealPlanIngredient
                {
                    MealPlanId = mealPlan.Id,
                    ProductId = product.Id
                });
            }

            await _context.SaveChangesAsync();

            // Fetch fully populated meal plan to return
            var fullyPopulated = await _context.MealPlans
                .Include(mp => mp.MealPlanIngredients)
                    .ThenInclude(mpi => mpi.Product)
                        .ThenInclude(p => p.Farm)
                .FirstOrDefaultAsync(mp => mp.Id == mealPlan.Id);

            return Ok(MapToResponse(fullyPopulated!));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var stringId = GuidHelper.FromGuid(id);
            var mealPlan = await _context.MealPlans.FirstOrDefaultAsync(mp => mp.Id == stringId);
            if (mealPlan == null)
            {
                return NotFound(new { message = "Không tìm thấy thực đơn mẫu." });
            }

            mealPlan.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa mềm thực đơn mẫu thành công." });
        }

        #region Helper Methods

        private MealPlanResponse MapToResponse(MealPlan mealPlan)
        {
            var ingredients = mealPlan.MealPlanIngredients
                .Select(mpi => mpi.Product)
                .Where(p => p != null)
                .Select(p => new GreenSolution.Core.DTOs.ProductResponse
                {
                    Id = GuidHelper.ResolveIdToGuid(p.Id),
                    FarmId = GuidHelper.ResolveIdToGuid(p.FarmId),
                    FarmName = p.Farm != null ? p.Farm.Name : string.Empty,
                    Name = p.Name,
                    Image = p.Image,
                    Price = (int)p.Price,
                    Category = p.Category,
                    Unit = p.Unit,
                    Stock = p.Stock,
                    IsActive = p.IsActive
                })
                .ToList();

            var totalPrice = ingredients.Sum(i => i.Price);

            return new MealPlanResponse
            {
                Id = GuidHelper.ResolveIdToGuid(mealPlan.Id),
                Title = mealPlan.Title,
                TargetAudience = mealPlan.TargetAudience,
                Calories = mealPlan.Calories,
                Dishes = mealPlan.Dishes ?? new List<string>(),
                Features = mealPlan.Features ?? new List<string>(),
                TotalPrice = totalPrice,
                IsActive = mealPlan.IsActive,
                Ingredients = ingredients
            };
        }

        #endregion
    }
}
