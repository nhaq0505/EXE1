namespace GreenSolution.Core.Entities
{
    public class Product
    {
        public string Id { get; set; } = null!;
        public string FarmId { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Image { get; set; } = null!;
        public decimal Price { get; set; }
        public string Category { get; set; } = null!;
        public string Unit { get; set; } = null!;
        public int Stock { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public Farm Farm { get; set; } = null!;
        public ICollection<MealPlanIngredient> MealPlanIngredients { get; set; } = new List<MealPlanIngredient>();
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
