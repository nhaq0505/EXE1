using System;

namespace GreenSolution.Core.DTOs
{
    public class ProductResponse
    {
        public Guid Id { get; set; }
        public Guid FarmId { get; set; }
        public string FarmName { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Image { get; set; } = null!;
        public int Price { get; set; }
        public string Category { get; set; } = null!;
        public string Unit { get; set; } = null!;
        public int Stock { get; set; }
        public bool IsActive { get; set; }
    }
}
