using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GreenSolution.Core.DTOs;

namespace GreenSolution.Core.Interfaces
{
    public interface IMealPlanService
    {
        Task<IEnumerable<MealPlanResponse>> GetAllAsync();
        Task<MealPlanResponse?> GetByIdAsync(Guid id);
    }
}
