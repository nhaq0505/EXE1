using System.Threading.Tasks;
using GreenSolution.Core.DTOs.AI;

namespace GreenSolution.Core.Interfaces
{
    public interface IAIChatService
    {
        Task<ChatResponse> GenerateResponseAsync(ChatRequest request);
    }
}
