using System;

namespace GreenSolution.Core.DTOs
{
    public class FarmResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Image { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Location { get; set; } = null!;
        public decimal Rating { get; set; }
        public string? VideoUrl { get; set; }
        public bool IsActive { get; set; }
    }
}
