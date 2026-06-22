using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GreenSolution.Core.DTOs;

namespace GreenSolution.Core.Interfaces
{
    public interface IProductService
    {
        Task<IEnumerable<ProductResponse>> GetProductsAsync(string? search, string? category, Guid? farmId, string? sort, int page, int limit);
        Task<int> GetProductsCountAsync(string? search, string? category, Guid? farmId);
        Task<IEnumerable<ProductResponse>> GetFeaturedAsync();
        Task<ProductResponse?> GetByIdAsync(Guid id);
        Task<IEnumerable<string>> GetCategoriesAsync();
    }
}
