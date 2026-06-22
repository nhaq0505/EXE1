using System;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using GreenSolution.Core.Interfaces;
using GreenSolution.Core.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GreenSolution.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public PaymentController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> ProcessWebhook()
        {
            using var reader = new StreamReader(Request.Body);
            string webhookBody = await reader.ReadToEndAsync();

            string payosSignature = Request.Headers["x-signature"].ToString();

            bool result = await _orderService.ProcessWebhookPaymentAsync(webhookBody, payosSignature);
            if (result)
            {
                return Ok(new { success = true, message = "Webhook processed successfully." });
            }
            return BadRequest(new { success = false, message = "Webhook processing failed or invalid signature." });
        }

        [Authorize]
        [HttpPost("{orderCode}/cancel")]
        public async Task<IActionResult> CancelOrder(long orderCode, [FromBody] CancelRequest? request)
        {
            var userId = GetCurrentUserId();
            string reason = request?.Reason ?? "Khách hàng yêu cầu hủy đơn hàng";

            bool result = await _orderService.CancelOrderAsync(userId, orderCode, reason);
            if (result)
            {
                return Ok(new { message = "Hủy đơn hàng thành công." });
            }
            return BadRequest(new { message = "Hủy đơn hàng thất bại." });
        }

        #region Helper Methods

        private Guid GetCurrentUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
            {
                throw new UnauthorizedAccessException("Không thể xác định thông tin người dùng từ token.");
            }
            return GuidHelper.ToGuid(userIdStr);
        }

        #endregion
    }

    public class CancelRequest
    {
        public string? Reason { get; set; }
    }
}
