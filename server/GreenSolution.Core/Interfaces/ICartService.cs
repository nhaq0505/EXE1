using System;
using System.Threading.Tasks;
using GreenSolution.Core.DTOs.Cart;

namespace GreenSolution.Core.Interfaces
{
    public interface ICartService
    {
        Task<CartResponse> GetCartAsync(Guid userId);
        Task<CartResponse> AddItemToCartAsync(Guid userId, AddToCartRequest request);
        Task<CartResponse> UpdateCartItemQuantityAsync(Guid userId, Guid productId, int quantity);
        Task<CartResponse> RemoveItemFromCartAsync(Guid userId, Guid productId);
        Task<CartResponse> ClearCartAsync(Guid userId);
        Task<CartResponse> AddMealPlanIngredientsToCartAsync(Guid userId, Guid planId);
    }
}
