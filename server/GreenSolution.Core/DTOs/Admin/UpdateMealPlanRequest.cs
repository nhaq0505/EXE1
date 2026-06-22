using System;
using System.Collections.Generic;

namespace GreenSolution.Core.DTOs.Admin
{
    public class UpdateMealPlanRequest
    {
        public string Title { get; set; } = null!;
        public string TargetAudience { get; set; } = null!;
        public int Calories { get; set; }
        public List<string> Dishes { get; set; } = new List<string>();
        public List<string> Features { get; set; } = new List<string>();
        public List<Guid> IngredientProductIds { get; set; } = new List<Guid>();
        public bool IsActive { get; set; }
    }
}
