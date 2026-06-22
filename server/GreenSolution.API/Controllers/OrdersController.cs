using System;
using System.Security.Claims;
using System.Threading.Tasks;
using GreenSolution.API.DTOs.Order;
using GreenSolution.Core.Interfaces;
using GreenSolution.Core.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GreenSolution.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            var userId = GetCurrentUserId();
            var response = await _orderService.CreateOrderAsync(userId, request);
            return Ok(response);
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            var userId = GetCurrentUserId();
            var response = await _orderService.GetOrdersAsync(userId);
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(Guid id)
        {
            var userId = GetCurrentUserId();
            var response = await _orderService.GetOrderByIdAsync(userId, id);
            if (response == null)
            {
                return NotFound(new { message = "Đơn hàng không tồn tại." });
            }
            return Ok(response);
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
}
