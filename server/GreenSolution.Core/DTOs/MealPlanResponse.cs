using System;
using System.Collections.Generic;

namespace GreenSolution.Core.DTOs
{
    public class MealPlanResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string TargetAudience { get; set; } = null!;
        public int Calories { get; set; }
        public List<string> Dishes { get; set; } = new List<string>();
        public List<string> Features { get; set; } = new List<string>();
        public int TotalPrice { get; set; }
        public bool IsActive { get; set; }
        public List<ProductResponse> Ingredients { get; set; } = new List<ProductResponse>();
    }
}
