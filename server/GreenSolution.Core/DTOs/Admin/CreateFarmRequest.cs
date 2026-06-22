using System;

namespace GreenSolution.Core.DTOs.Admin
{
    public class CreateFarmRequest
    {
        public string Name { get; set; } = null!;
        public string Image { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Location { get; set; } = null!;
        public decimal Rating { get; set; }
        public string? VideoUrl { get; set; }
    }
}
