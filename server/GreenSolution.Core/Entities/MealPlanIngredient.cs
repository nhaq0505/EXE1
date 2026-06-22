namespace GreenSolution.Core.Entities
{
    public class MealPlanIngredient
    {
        public string MealPlanId { get; set; } = null!;
        public MealPlan MealPlan { get; set; } = null!;

        public string ProductId { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}
