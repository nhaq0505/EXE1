using System.Collections.Generic;

namespace GreenSolution.Core.DTOs.AI
{
    public class ChatRequest
    {
        public List<ContentDto> History { get; set; } = new();
        public string Message { get; set; } = null!;
    }
}
