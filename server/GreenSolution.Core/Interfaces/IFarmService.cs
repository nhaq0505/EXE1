using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GreenSolution.Core.DTOs;

namespace GreenSolution.Core.Interfaces
{
    public interface IFarmService
    {
        Task<IEnumerable<FarmResponse>> GetAllAsync(string? search);
        Task<IEnumerable<FarmResponse>> GetFeaturedAsync();
        Task<FarmResponse?> GetByIdAsync(Guid id);
    }
}
