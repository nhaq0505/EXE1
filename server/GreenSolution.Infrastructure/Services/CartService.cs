using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GreenSolution.Core.DTOs.Cart;
using GreenSolution.Core.Entities;
using GreenSolution.Core.Exceptions;
using GreenSolution.Core.Interfaces;
using GreenSolution.Core.Utils;
using GreenSolution.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GreenSolution.Infrastructure.Services
{
    public class CartService : ICartService
    {
        private readonly AppDbContext _context;

        public CartService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CartResponse> GetCartAsync(Guid userId)
        {
            var userIdStr = GuidHelper.FromGuid(userId);
            return await GetCartResponseInternalAsync(userIdStr);
        }

        public async Task<CartResponse> AddItemToCartAsync(Guid userId, AddToCartRequest request)
        {
            var userIdStr = GuidHelper.FromGuid(userId);
            var productIdStr = GuidHelper.FromGuid(request.ProductId);

            // Ensure cart is initialized
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userIdStr);

            if (cart == null)
            {
                cart = new Cart
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userIdStr,
                    CartItems = new List<CartItem>()
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            // Find product and validate
            var product = await _context.Products
                .Include(p => p.Farm)
                .FirstOrDefaultAsync(p => p.Id == productIdStr);

            if (product == null)
            {
                throw new NotFoundException($"Sản phẩm với ID {request.ProductId} không tồn tại.");
            }

            if (!product.IsActive)
            {
                throw new BadRequestException($"Sản phẩm {product.Name} hiện không hoạt động.");
            }

            if (product.Stock < request.Quantity)
            {
                throw new BadRequestException($"Sản phẩm {product.Name} không đủ tồn kho. Tồn kho hiện tại: {product.Stock}, yêu cầu: {request.Quantity}.");
            }

            // Check if item already exists in cart
            var existingItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == productIdStr);
            if (existingItem != null)
            {
                int newQuantity = existingItem.Quantity + request.Quantity;
                if (newQuantity > product.Stock)
                {
                    throw new BadRequestException($"Tổng số lượng sản phẩm {product.Name} trong giỏ hàng ({newQuantity}) vượt quá tồn kho hiện tại ({product.Stock}).");
                }
                existingItem.Quantity = newQuantity;
            }
            else
            {
                var newItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = productIdStr,
                    Quantity = request.Quantity
                };
                _context.CartItems.Add(newItem);
            }

            await _context.SaveChangesAsync();

            return await GetCartResponseInternalAsync(userIdStr);
        }

        public async Task<CartResponse> UpdateCartItemQuantityAsync(Guid userId, Guid productId, int quantity)
        {
            var userIdStr = GuidHelper.FromGuid(userId);
            var productIdStr = GuidHelper.FromGuid(productId);

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userIdStr);

            if (cart == null)
            {
                cart = new Cart
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userIdStr,
                    CartItems = new List<CartItem>()
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            var item = cart.CartItems.FirstOrDefault(ci => ci.ProductId == productIdStr);
            if (item == null)
            {
                throw new NotFoundException("Sản phẩm không có trong giỏ hàng.");
            }

            if (quantity <= 0)
            {
                _context.CartItems.Remove(item);
            }
            else
            {
                if (item.Product.Stock < quantity)
                {
                    throw new BadRequestException($"Sản phẩm {item.Product.Name} không đủ tồn kho. Tồn kho hiện tại: {item.Product.Stock}, yêu cầu: {quantity}.");
                }
                item.Quantity = quantity;
            }

            await _context.SaveChangesAsync();

            return await GetCartResponseInternalAsync(userIdStr);
        }

        public async Task<CartResponse> RemoveItemFromCartAsync(Guid userId, Guid productId)
        {
            var userIdStr = GuidHelper.FromGuid(userId);
            var productIdStr = GuidHelper.FromGuid(productId);

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userIdStr);

            if (cart != null)
            {
                var item = cart.CartItems.FirstOrDefault(ci => ci.ProductId == productIdStr);
                if (item != null)
                {
                    _context.CartItems.Remove(item);
                    await _context.SaveChangesAsync();
                }
            }

            return await GetCartResponseInternalAsync(userIdStr);
        }

        public async Task<CartResponse> ClearCartAsync(Guid userId)
        {
            var userIdStr = GuidHelper.FromGuid(userId);
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userIdStr);

            if (cart != null && cart.CartItems.Any())
            {
                _context.CartItems.RemoveRange(cart.CartItems);
                await _context.SaveChangesAsync();
            }

            return await GetCartResponseInternalAsync(userIdStr);
        }

        public async Task<CartResponse> AddMealPlanIngredientsToCartAsync(Guid userId, Guid planId)
        {
            var userIdStr = GuidHelper.FromGuid(userId);
            var planIdStr = GuidHelper.FromGuid(planId);

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userIdStr);

            if (cart == null)
            {
                cart = new Cart
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userIdStr,
                    CartItems = new List<CartItem>()
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            var mealPlan = await _context.MealPlans
                .Include(mp => mp.MealPlanIngredients)
                    .ThenInclude(mpi => mpi.Product)
                .FirstOrDefaultAsync(mp => mp.Id == planIdStr);

            if (mealPlan == null)
            {
                throw new NotFoundException("Meal Plan không tồn tại.");
            }

            foreach (var ingredient in mealPlan.MealPlanIngredients)
            {
                var product = ingredient.Product;
                if (product != null && product.IsActive && product.Stock > 0)
                {
                    var existingItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == product.Id);
                    if (existingItem != null)
                    {
                        int newQuantity = existingItem.Quantity + 1;
                        if (newQuantity <= product.Stock)
                        {
                            existingItem.Quantity = newQuantity;
                        }
                    }
                    else
                    {
                        var newItem = new CartItem
                        {
                            CartId = cart.Id,
                            ProductId = product.Id,
                            Quantity = 1
                        };
                        _context.CartItems.Add(newItem);
                    }
                }
            }

            await _context.SaveChangesAsync();

            return await GetCartResponseInternalAsync(userIdStr);
        }

        #region Helper Methods

        private async Task<CartResponse> GetCartResponseInternalAsync(string userIdStr)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                        .ThenInclude(p => p.Farm)
                .FirstOrDefaultAsync(c => c.UserId == userIdStr);

            if (cart == null)
            {
                cart = new Cart
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userIdStr,
                    CartItems = new List<CartItem>()
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            var items = new List<CartItemResponse>();
            int totalAmount = 0;

            foreach (var item in cart.CartItems)
            {
                if (item.Product != null)
                {
                    int price = (int)item.Product.Price;
                    int quantity = item.Quantity;
                    totalAmount += price * quantity;

                    items.Add(new CartItemResponse
                    {
                        Id = GuidHelper.ToGuid("ci_" + item.Id),
                        ProductId = GuidHelper.ToGuid(item.ProductId),
                        ProductName = item.Product.Name,
                        ProductImage = item.Product.Image,
                        ProductPrice = price,
                        ProductUnit = item.Product.Unit,
                        ProductStock = item.Product.Stock,
                        FarmName = item.Product.Farm != null ? item.Product.Farm.Name : string.Empty,
                        Quantity = quantity
                    });
                }
            }

            return new CartResponse
            {
                Id = GuidHelper.ToGuid(cart.Id),
                UserId = GuidHelper.ToGuid(cart.UserId),
                Items = items,
                TotalAmount = totalAmount
            };
        }

        #endregion
    }
}
