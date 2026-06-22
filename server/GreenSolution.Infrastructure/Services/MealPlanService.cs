using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GreenSolution.Core.DTOs;
using GreenSolution.Core.Entities;
using GreenSolution.Core.Interfaces;
using GreenSolution.Core.Utils;
using GreenSolution.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GreenSolution.Infrastructure.Services
{
    public class MealPlanService : IMealPlanService
    {
        private readonly AppDbContext _context;

        public MealPlanService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MealPlanResponse>> GetAllAsync()
        {
            var mealPlans = await _context.MealPlans
                .Include(mp => mp.MealPlanIngredients)
                    .ThenInclude(mpi => mpi.Product)
                        .ThenInclude(p => p.Farm)
                .ToListAsync();

            return mealPlans.Select(MapToResponse);
        }

        public async Task<MealPlanResponse?> GetByIdAsync(Guid id)
        {
            var stringId = GuidHelper.ResolveGuidToId(id);
            var mealPlan = await _context.MealPlans
                .Include(mp => mp.MealPlanIngredients)
                    .ThenInclude(mpi => mpi.Product)
                        .ThenInclude(p => p.Farm)
                .FirstOrDefaultAsync(mp => mp.Id == stringId);

            if (mealPlan == null)
            {
                return null;
            }

            return MapToResponse(mealPlan);
        }

        private static MealPlanResponse MapToResponse(MealPlan mealPlan)
        {
            var ingredients = mealPlan.MealPlanIngredients
                .Select(mpi => mpi.Product)
                .Where(p => p != null)
                .Select(p => new ProductResponse
                {
                    Id = GuidHelper.ResolveIdToGuid(p.Id),
                    FarmId = GuidHelper.ResolveIdToGuid(p.FarmId),
                    FarmName = p.Farm != null ? p.Farm.Name : string.Empty,
                    Name = p.Name,
                    Image = p.Image,
                    Price = (int)p.Price,
                    Category = p.Category,
                    Unit = p.Unit,
                    Stock = p.Stock
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
    }
}
