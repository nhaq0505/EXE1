namespace GreenSolution.Core.Entities
{
    public class MealPlan
    {
        public string Id { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string TargetAudience { get; set; } = null!;
        public int Calories { get; set; }
        public List<string> Dishes { get; set; } = new List<string>();
        public List<string> Features { get; set; } = new List<string>();
        public decimal TotalPrice { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public ICollection<MealPlanIngredient> MealPlanIngredients { get; set; } = new List<MealPlanIngredient>();
    }
}
