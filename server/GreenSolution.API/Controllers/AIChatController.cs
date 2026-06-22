using System.Threading.Tasks;
using GreenSolution.API.DTOs.AI;
using GreenSolution.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GreenSolution.API.Controllers
{
    [ApiController]
    [Route("api/ai")]
    [Route("api/[controller]")]
    public class AIChatController : ControllerBase
    {
        private readonly IAIChatService _aiChatService;

        public AIChatController(IAIChatService aiChatService)
        {
            _aiChatService = aiChatService;
        }

        [Authorize]
        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Request body cannot be null" });
            }

            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { message = "Message is required" });
            }

            var response = await _aiChatService.GenerateResponseAsync(request);
            
            // Map core response to API response DTO
            var apiResponse = new ChatResponse
            {
                ResponseText = response.ResponseText
            };

            return Ok(apiResponse);
        }
    }
}
