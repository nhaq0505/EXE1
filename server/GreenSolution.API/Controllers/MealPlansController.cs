using System;
using System.Threading.Tasks;
using GreenSolution.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GreenSolution.API.Controllers
{
    [ApiController]
    [Route("api/meal-plans")]
    public class MealPlansController : ControllerBase
    {
        private readonly IMealPlanService _mealPlanService;

        public MealPlansController(IMealPlanService mealPlanService)
        {
            _mealPlanService = mealPlanService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var mealPlans = await _mealPlanService.GetAllAsync();
            return Ok(mealPlans);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var mealPlan = await _mealPlanService.GetByIdAsync(id);
            if (mealPlan == null)
            {
                return NotFound(new { message = "Meal plan not found" });
            }
            return Ok(mealPlan);
        }
    }
}
