namespace GreenSolution.Core.Entities
{
    public class Farm
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Image { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Location { get; set; } = null!;
        public double Rating { get; set; }
        public string? VideoUrl { get; set; }
        public bool IsActive { get; set; } = true;

        public string? OwnerId { get; set; }
        public virtual User? Owner { get; set; }

        // Navigation property
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
