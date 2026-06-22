using System;
using System.Security.Claims;
using System.Threading.Tasks;
using GreenSolution.API.DTOs.Cart;
using GreenSolution.Core.Interfaces;
using GreenSolution.Core.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GreenSolution.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetCurrentUserId();
            var response = await _cartService.GetCartAsync(userId);
            return Ok(response);
        }

        [HttpPost("items")]
        public async Task<IActionResult> AddItem([FromBody] AddToCartRequest request)
        {
            ValidateModel();
            var userId = GetCurrentUserId();
            var response = await _cartService.AddItemToCartAsync(userId, request);
            return Ok(response);
        }

        [HttpPatch("items/{productId}")]
        public async Task<IActionResult> UpdateItem(Guid productId, [FromBody] UpdateCartItemRequest request)
        {
            ValidateModel();
            var userId = GetCurrentUserId();
            var response = await _cartService.UpdateCartItemQuantityAsync(userId, productId, request.Quantity);
            return Ok(response);
        }

        [HttpDelete("items/{productId}")]
        public async Task<IActionResult> RemoveItem(Guid productId)
        {
            var userId = GetCurrentUserId();
            var response = await _cartService.RemoveItemFromCartAsync(userId, productId);
            return Ok(response);
        }

        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetCurrentUserId();
            var response = await _cartService.ClearCartAsync(userId);
            return Ok(response);
        }

        [HttpPost("meal-plan/{planId}")]
        public async Task<IActionResult> AddMealPlanIngredients(Guid planId)
        {
            var userId = GetCurrentUserId();
            var response = await _cartService.AddMealPlanIngredientsToCartAsync(userId, planId);
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

        private void ValidateModel()
        {
            if (!ModelState.IsValid)
            {
                var failures = ModelState
                    .Where(x => x.Value != null && x.Value.Errors.Count > 0)
                    .SelectMany(x => x.Value!.Errors.Select(e => new FluentValidation.Results.ValidationFailure(x.Key, e.ErrorMessage)))
                    .ToList();
                throw new FluentValidation.ValidationException(failures);
            }
        }

        #endregion
    }
}
