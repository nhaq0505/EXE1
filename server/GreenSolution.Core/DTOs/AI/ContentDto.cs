using System.Collections.Generic;

namespace GreenSolution.Core.DTOs.AI
{
    public class ContentDto
    {
        public string Role { get; set; } = null!;
        public List<PartDto> Parts { get; set; } = new();
    }
}
