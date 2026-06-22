using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GreenSolution.Core.DTOs;
using GreenSolution.Core.Entities;
using GreenSolution.Core.Interfaces;
using GreenSolution.Core.Utils;
using GreenSolution.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GreenSolution.Infrastructure.Services
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _context;

        public ProductService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductResponse>> GetProductsAsync(
            string? search,
            string? category,
            Guid? farmId,
            string? sort,
            int page,
            int limit)
        {
            var query = _context.Products.Include(p => p.Farm).Where(p => p.IsActive);

            query = ApplyFilters(query, search, category, farmId);

            // Sorting
            if (!string.IsNullOrWhiteSpace(sort))
            {
                switch (sort.ToLower())
                {
                    case "price_asc":
                        query = query.OrderBy(p => p.Price);
                        break;
                    case "price_desc":
                        query = query.OrderByDescending(p => p.Price);
                        break;
                    case "name_asc":
                        query = query.OrderBy(p => p.Name);
                        break;
                    case "name_desc":
                        query = query.OrderByDescending(p => p.Name);
                        break;
                    default:
                        query = query.OrderBy(p => p.Id);
                        break;
                }
            }
            else
            {
                query = query.OrderBy(p => p.Id);
            }

            // Pagination
            var products = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return products.Select(MapToResponse);
        }

        public async Task<int> GetProductsCountAsync(string? search, string? category, Guid? farmId)
        {
            var query = _context.Products.Where(p => p.IsActive);
            query = ApplyFilters(query, search, category, farmId);
            return await query.CountAsync();
        }

        public async Task<IEnumerable<ProductResponse>> GetFeaturedAsync()
        {
            var products = await _context.Products
                .Include(p => p.Farm)
                .Where(p => p.IsActive)
                .Take(4)
                .ToListAsync();

            return products.Select(MapToResponse);
        }

        public async Task<ProductResponse?> GetByIdAsync(Guid id)
        {
            var stringId = GuidHelper.ResolveGuidToId(id);
            var product = await _context.Products
                .Include(p => p.Farm)
                .FirstOrDefaultAsync(p => p.Id == stringId && p.IsActive);

            if (product == null)
            {
                return null;
            }

            return MapToResponse(product);
        }

        public async Task<IEnumerable<string>> GetCategoriesAsync()
        {
            return await _context.Products
                .Where(p => p.IsActive)
                .Select(p => p.Category)
                .Distinct()
                .ToListAsync();
        }

        #region Helper Methods

        private static IQueryable<Product> ApplyFilters(
            IQueryable<Product> query,
            string? search,
            string? category,
            Guid? farmId)
        {
            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(lowerSearch));
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                var lowerCategory = category.ToLower();
                query = query.Where(p => p.Category.ToLower() == lowerCategory);
            }

            if (farmId.HasValue && farmId.Value != Guid.Empty)
            {
                var farmIdStr = GuidHelper.ResolveGuidToId(farmId.Value);
                query = query.Where(p => p.FarmId == farmIdStr);
            }

            return query;
        }

        private static ProductResponse MapToResponse(Product product)
        {
            return new ProductResponse
            {
                Id = GuidHelper.ResolveIdToGuid(product.Id),
                FarmId = GuidHelper.ResolveIdToGuid(product.FarmId),
                FarmName = product.Farm != null ? product.Farm.Name : string.Empty,
                Name = product.Name,
                Image = product.Image,
                Price = (int)product.Price,
                Category = product.Category,
                Unit = product.Unit,
                Stock = product.Stock,
                IsActive = product.IsActive
            };
        }

        #endregion
    }
}
